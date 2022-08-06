from http import HTTPStatus
import logging
import os
from secrets import token_urlsafe
from flask_socketio import SocketIO
from typing import Any
from flask import Flask, Response, abort, jsonify
from wiki_reveal.exceptions import WikiError
from wiki_reveal.game_id import get_game_id, get_start_and_end

from wiki_reveal.wiki import get_game_page_name, get_page, tokenize

logging.basicConfig(
    level=int(os.environ.get("WR_LOGLEVEL", logging.INFO)),
    format="%(asctime)s  %(levelname)s  %(message)s",
)

app = Flask('Wiki-Reveal')
app.config['SECRET_KEY'] = token_urlsafe(16)
socketio = SocketIO(app)


@app.get(f'/api/test.txt')
def root():
    return Response("""Yes,\nthe server is online.\n""")


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


@app.get(f'/api/yesterday')
@app.get(f'/api/yesterday/<language>')
def yesterday(language: str = 'en'):
    current_id = get_game_id() - 1
    if (current_id < 0):
      logging.error('Request for yesterday\'s game though today is the first game')
      abort(HTTPStatus.BAD_REQUEST)

    logging.info(f'Request for yesterday\'s game with id {current_id} ({language})')

    response_data = get_page_payload(language, current_id)
    response_data['isYesterday'] = True

    return jsonify(response_data)


@app.get(f'/api/page')
@app.get(f'/api/page/<language>')
def page(language: str = 'en'):
    current_id = get_game_id()
    logging.info(f'Request for game with id {current_id} ({language})')

    response_data = get_page_payload(language, current_id)

    if current_id > 0:
      yesterday = get_game_page_name(current_id - 1)
      response_data['yesterdaysTitle'] = tuple(tokenize(yesterday.replace('_', ' ')))

    return jsonify(response_data)
