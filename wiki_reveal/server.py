from functools import lru_cache
from http import HTTPStatus
import logging
import os
from random import randint
import re
from secrets import token_urlsafe
from flask_socketio import (  # type: ignore
    SocketIO, join_room, leave_room, send, rooms,
)
from typing import Any
from flask import Flask, Response, abort, jsonify, request
from wiki_reveal.exceptions import WikiError
from wiki_reveal.game_id import get_game_id, get_start_and_end
from wiki_reveal.generate_name import generate_name
from wiki_reveal.rooms import (
    add_coop_game, add_coop_user, clear_old_coop_games, coop_game_exists, remove_coop_user, rename_user,
)

from wiki_reveal.wiki import (
    get_game_page_name, get_number_of_options, get_page, tokenize,
)

logging.basicConfig(
    level=int(os.environ.get("WR_LOGLEVEL", logging.INFO)),
    format="%(asctime)s  %(levelname)s  %(message)s",
)

app = Flask('Wiki-Reveal')
app.config['SECRET_KEY'] = token_urlsafe(16)
socketio = SocketIO(app)


def get_or(data: dict[str, Any], key: str, default: Any) -> Any:
    value = data.get(key)
    if value is None:
        return default
    return value


@socketio.on('create game')
def coop_on_create(data: dict[str, Any]):
    clear_old_coop_games()
    room = get_or(data, 'room', token_urlsafe(16))
    username = get_or(data, 'username', generate_name())
    game_id = (
        get_game_id()
        if data.get('random', False)
        else randint(0, get_number_of_options())
    )

    join_room(room)
    add_coop_game(room, game_id, request.sid, username)

    logging.info(f'Created a game with id {room} ({game_id}) for {request.sid}')

    send(
        {
            "type": 'CREATE',
            "room": room,
            "username": username,
        },
        to=room,

    )


@socketio.on('rename')
def coop_on_rename(data: dict[str, Any]):
    from_name = data['from']
    to_name = get_or(data, 'to', generate_name())
    room = data['room']

    if room is None:
        send(
            {
                "type": 'RENAME',
                "from": from_name,
                "to": to_name,
            },
            to=request.sid,
        )
    else:
        rename_user(room, request.sid, to_name)
        send(
            {
                "type": 'RENAME',
                "from": from_name,
                "to": to_name,
            },
            to=room,
        )


@socketio.on('join')
def coop_on_join(data: dict[str, Any]):
    username = get_or(data, 'username', generate_name())
    room = data['room']
    if not coop_game_exists(room):
        send(
            {
                "type": 'JOIN-FAIL',
                "reason": 'Room does not exist',
            },
            to=request.sid,
        )
    else:
        join_room(room)
        send(
            {
                "type": 'JOIN',
                "name": username,
                "users": add_coop_user(room, request.sid, username),
            },
            to=room,
        )


@socketio.on('leave')
def coop_on_leave(data: dict[str, Any]):
    username = data.get('username', None)
    room = data['room']
    if (username):
        send(
            {
                "type": 'LEAVE',
                "name": username,
                "users": remove_coop_user(room, request.sid, username),
            },
            to=room,
        )
    leave_room(room)


@socketio.on('disconnect')
def coop_on_disconnect():
    for room in rooms(request.sid):
        username, users = remove_coop_user(room, request.sid)
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
def get_page_payload(language: str, game_id: int) -> dict[str, Any]:
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
