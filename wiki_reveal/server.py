from collections import defaultdict
from datetime import datetime
from functools import cache, lru_cache
from hashlib import sha256
from http import HTTPStatus
import logging
import os
from random import Random
from secrets import token_hex, token_urlsafe
from time import time
from flask_socketio import (  # type: ignore
    SocketIO, join_room, leave_room, send, rooms,
)
from typing import Any, Optional, cast, Union
from flask import Flask, Response, abort, jsonify, request
from wiki_reveal.about import get_about
from wiki_reveal.exceptions import CoopGameDoesNotExistError, WikiError
from wiki_reveal.game_id import (
    get_game_id, get_start_and_end, get_start_of_current,
)
from wiki_reveal.generate_name import generate_name
from wiki_reveal.page_options import get_number_of_options
from wiki_reveal.rooms import (
    active_rooms, add_coop_game, add_coop_guess, add_coop_user,
    clear_old_coop_games,
    coop_game_exists, coop_game_is_full, get_room_data, remove_coop_user,
    rename_user,
)

from wiki_reveal.wiki import (
    get_game_page_name, get_page, tokenize,
)

logging.basicConfig(
    level=int(os.environ.get("WR_LOGLEVEL", logging.INFO)),
    format="%(asctime)s  %(levelname)s  %(message)s",
)


def coors_or_none() -> Optional[list[str]]:
    coors = os.environ.get('WR_WS_COORS')
    if coors:
        split = [c.strip() for c in coors.split('|')]
        logging.info(f'Allowing websockets from {coors}')
        return split
    else:
        logging.info(f'No COORS for websockets setup')
    return None


debug_ws = os.environ.get('WR_WS_DEBUG') is not None
if debug_ws:
    logging.info('Will debug log web-socket traffic')

app = Flask('Wiki-Reveal')
app.config['SECRET_KEY'] = token_urlsafe(16)

socketio = SocketIO(
    app,
    cors_allowed_origins=coors_or_none(),
    engineio_logger=debug_ws,
    logger=debug_ws,
)


def get_or(data: dict[str, Any], key: str, default: Any) -> Any:
    value = data.get(key)
    if value is None:
        return default
    return value


def get_sid(r: Any) -> str:
    if hasattr(r, 'sid'):
        return cast(str, r.sid)
    raise ValueError


@socketio.on('create game')
def coop_on_create(data: dict[str, Any]):
    clear_old_coop_games()
    room = token_hex(16)
    username = get_or(data, 'username', generate_name())
    is_random = data['gameType'] == 'random'
    is_yesterdays = data['gameType'] == 'yesterday'
    ends_today = data['expireType'] == 'today'
    guesses = data.get('guesses', [])
    settings = data.get('settings', {})
    game_id = (
        Random(time()).randint(0, get_number_of_options() - 1)
        if is_random
        else max(get_game_id() - (1 if is_yesterdays else 0), 0)
    )
    start: Optional[datetime] = None if is_random else get_start_of_current()
    duration = None if ends_today else data['expire']
    sid = get_sid(request)
    join_room(room)
    backlog = add_coop_game(
        room, game_id, sid, username, start, duration, guesses, settings,
    )

    logging.info(f'Created a game with id {room} ({game_id}) for {sid}')

    send(
        {
            "type": 'CREATE',
            "room": room,
            "username": username,
            "backlog": backlog,
            "settings": settings,
        },
        to=room,

    )


@socketio.on('guess')
def coop_on_guess(data: dict[str, Any]):
    room = data['room']
    username = data['username']
    lex = data['lex']
    is_hint = data['isHint']

    try:
        idx = add_coop_guess(room, username, lex, is_hint)
    except CoopGameDoesNotExistError:
        logging.error(f'Someone tried to guess "{lex}" in room {room}')
        abort(HTTPStatus.BAD_REQUEST)

    if idx >= 0:
        send(
            {
                "type": 'GUESS',
                "username": username,
                "lex": lex,
                "index": idx,
                "isHint": is_hint,
            },
            to=room,

        )
    else:
        logging.warn(
            f'Someone tried to guess duplicate lex "{lex}" in room {room}',
        )


@socketio.on('rename')
def coop_on_rename(data: dict[str, Any]):
    from_name = data['from']
    to_name = get_or(data, 'to', generate_name())
    room = data.get('room')
    sid = get_sid(request)

    if room is not None:
        rename_user(room, sid, to_name)
        send(
            {
                "type": 'RENAME',
                "from": from_name,
                "to": to_name,
            },
            to=room,
        )

    send(
        {
            "type": 'RENAME-ME',
            "to": to_name,
        },
        to=sid,
    )


@socketio.on('join')
def coop_on_join(data: dict[str, Any]):
    username = get_or(data, 'username', generate_name())
    room = data['room']
    sid = get_sid(request)

    if not coop_game_exists(room):
        send(
            {
                "type": 'JOIN-FAIL',
                "reason": 'Room does not exist',
            },
            to=sid,
        )
    elif coop_game_is_full(room):
        send(
            {
                "type": 'JOIN-FAIL',
                "reason": 'Room is full',
            },
            to=sid,
        )
    else:
        users, backlog, settings = add_coop_user(room, sid, username)
        send(
            {
                "type": 'JOIN',
                "name": username,
                "users": users,
            },
            to=room,
        )

        join_room(room)

        if username != data.get('username'):
            send(
                {
                    "type": 'RENAME-ME',
                    "to": username,
                },
                to=sid,
            )

        send(
            {
                "type": "JOIN-ME",
                "room": room,
                "users": users,
                "backlog": backlog,
                "settings": settings,
            },
            to=sid
        )


@socketio.on('leave')
def coop_on_leave(data: dict[str, Any]):
    username = data.get('username', None)
    room = data['room']
    sid = get_sid(request)

    leave_room(room)

    if (username):
        send(
            {
                "type": 'LEAVE',
                "name": username,
                "users": remove_coop_user(room, sid),
            },
            to=room,
        )

    send({"type": "LEAVE-ME"}, to=sid)


@socketio.on('disconnect')
def coop_on_disconnect():
    sid = get_sid(request)

    for room in rooms(sid):
        username, users = remove_coop_user(room, sid)
        if username is not None:
            send(
                {
                    "type": 'LEAVE',
                    "name": username,
                    "users": users,
                },
                to=room,
            )
        leave_room(room)


@app.get('/api/test.txt')
def root():
    return Response("""Yes,\nthe server is online.\n""")


@lru_cache(maxsize=256)
def get_page_payload(
    language: str,
    game_id: int,
) -> dict[str, Any]:
    start, end = get_start_and_end(game_id)
    try:
        page_name = get_game_page_name(game_id)
    except WikiError:
        logging.exception('Could not load game page')
        abort(HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        logging.exception('Unexpected error occured')
        abort(HTTPStatus.INTERNAL_SERVER_ERROR)

    return {
      'start': start,
      'end': end,
      'language': language,
      'gameId': game_id,
      'pageName': page_name,
      'page': get_page(
          page_name,
          language=language,
      ).to_json(),
    }


@cache
def visitor_stats():
    return {
        'solo': defaultdict(set),
        'coop': set()
    }


def add_visitor(
    ip: Union[str, list[str]],
    is_coop: bool,
    game_id: int = 0
):
    visitors = visitor_stats()
    if type(ip) == list:
        if (ip):
            ip = ip[0]
        else:
            ip = ''
    digest = sha256(cast(str, ip).encode()).hexdigest()[::2]

    if is_coop:
        visitors['coop'].add(digest)
    else:
        visitors['solo'][game_id].add(digest)


@app.get('/api/yesterday')
@app.get('/api/yesterday/<language>')
def yesterday(language: str = 'en'):
    current_id = get_game_id() - 1
    if (current_id < 0):
        logging.error(
            'Request for yesterday\'s game though today is the first game',
        )
        abort(HTTPStatus.BAD_REQUEST)

    if not (ip := request.headers.getlist("X-Forwarded-For")):
        ip = request.remote_addr
    add_visitor(ip, False, current_id)

    logging.info(
        f'Request for yesterday\'s game with id {current_id} ({language})',
    )

    response_data = get_page_payload(language, current_id)
    response_data['isYesterday'] = True

    return jsonify(response_data)


@app.get('/api/page')
@app.get('/api/page/<language>')
def page(language: str = 'en'):
    current_id = get_game_id()
    logging.info(f'Request for game with id {current_id} ({language})')

    if not (ip := request.headers.getlist("X-Forwarded-For")):
        ip = request.remote_addr
    add_visitor(ip, False, current_id)

    response_data = get_page_payload(language, current_id)

    if current_id > 0:
        yesterday = get_game_page_name(current_id - 1)
        response_data['yesterdaysPage'] = yesterday
        response_data['yesterdaysTitle'] = tuple(
            tokenize(yesterday.replace('_', ' ')),
        )

    return jsonify(response_data)


@app.get('/api/coop/<room>')
def coop_room(room: str):
    try:
        start, override_end, game_id = get_room_data(room)
    except CoopGameDoesNotExistError:
        abort(HTTPStatus.BAD_REQUEST)

    if not (ip := request.headers.getlist("X-Forwarded-For")):
        ip = request.remote_addr
    add_visitor(ip, True)

    response_data = get_page_payload('en', game_id)
    response_data['start'] = start.isoformat().replace(' ', 'T')
    if override_end is not None:
        response_data['end'] = override_end.isoformat().replace(' ', 'T')

    return jsonify(response_data)



@app.get('/api/about')
def about_game():
    return jsonify(get_about())


boot_day = get_game_id()


@app.get('/api/stats')
def stats():
    visitors = visitor_stats()

    return jsonify({
        'info': 'Stats since last reboot',
        'bootWas': boot_day,
        'todayIs': get_game_id(),
        'coop': len(visitors['coop']),
        'coopActiveGames': active_rooms(),
        'solo': {
            game_id: len(users) for game_id, users in visitors['solo'].items()
        },
    })
