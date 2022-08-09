from datetime import datetime
from functools import lru_cache
from http import HTTPStatus
import logging
import os
from random import randint
from secrets import token_hex, token_urlsafe
from flask_socketio import (  # type: ignore
    SocketIO, join_room, leave_room, send, rooms,
)
from typing import Any, Optional, cast
from flask import Flask, Response, abort, jsonify, request
from wiki_reveal.exceptions import CoopGameDoesNotExistError, WikiError
from wiki_reveal.game_id import (
    get_game_id, get_start_and_end, get_start_of_current,
)
from wiki_reveal.generate_name import generate_name
from wiki_reveal.rooms import (
    add_coop_game, add_coop_guess, add_coop_user, clear_old_coop_games,
    coop_game_exists, coop_game_is_full, get_room_data, remove_coop_user,
    rename_user,
)

from wiki_reveal.wiki import (
    get_game_page_name, get_number_of_options, get_page, tokenize,
)

logging.basicConfig(
    level=int(os.environ.get("WR_LOGLEVEL", logging.INFO)),
    format="%(asctime)s  %(levelname)s  %(message)s",
)


def coors_or_none() -> Optional[str]:
    coors = os.environ.get('WR_WS_COORS')
    if coors:
        return coors
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
    isToday = data['gameType'] == 'today'
    endsToday = data['expireType'] == 'today'
    game_id = (
        get_game_id()
        if isToday
        else randint(0, get_number_of_options())
    )
    start: Optional[datetime] = get_start_of_current() if isToday else None
    duration = None if endsToday else data['expire']
    sid = get_sid(request)
    join_room(room)
    add_coop_game(room, game_id, not isToday, sid, username, start, duration)

    logging.info(f'Created a game with id {room} ({game_id}) for {sid}')

    send(
        {
            "type": 'CREATE',
            "room": room,
            "username": username,
        },
        to=room,

    )


@socketio.on('guess')
def coop_on_guess(data: dict[str, Any]):
    room = data['room']
    username = data['username']
    lex = data['lex']

    try:
        idx = add_coop_guess(room, username, lex)
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
        users, backlog = add_coop_user(room, sid, username)
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
    rng_seed: Optional[int] = None,
) -> dict[str, Any]:
    start, end = get_start_and_end(game_id)
    try:
        page_name = get_game_page_name(game_id, rng_seed)
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


@app.get('/api/yesterday')
@app.get('/api/yesterday/<language>')
def yesterday(language: str = 'en'):
    current_id = get_game_id() - 1
    if (current_id < 0):
        logging.error(
            'Request for yesterday\'s game though today is the first game',
        )
        abort(HTTPStatus.BAD_REQUEST)

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

    response_data = get_page_payload(language, current_id)

    if current_id > 0:
        yesterday = get_game_page_name(current_id - 1)
        response_data['yesterdaysTitle'] = tuple(
            tokenize(yesterday.replace('_', ' ')),
        )

    return jsonify(response_data)


@app.get('/api/coop/<room>')
def coop_room(room: str):
    try:
        start, override_end, game_id, rng_seed = get_room_data(room)
    except CoopGameDoesNotExistError:
        abort(HTTPStatus.BAD_REQUEST)

    response_data = get_page_payload('en', game_id, rng_seed)
    response_data['start'] = start.isoformat().replace(' ', 'T')
    if override_end is not None:
        response_data['end'] = override_end.isoformat().replace(' ', 'T')

    return jsonify(response_data)
