from http import HTTPStatus
import logging
import os
from typing import Optional
from flask import Flask, Response, abort, jsonify
from wiki_reveal.exceptions import WikiError
from wiki_reveal.game_id import get_game_id

from wiki_reveal.wiki import get_game_page_name, get_page

logging.basicConfig(
    level=int(os.environ.get("LOGLEVEL", logging.INFO)),
    format="%(asctime)s  %(levelname)s  %(message)s",
)

app = Flask('Wiki-Reveal')


@app.get('/api/test.txt')
def root():
    return Response("""Yes,\nthe server is online.\n""")


@app.get('/api/page')
@app.get('/api/page/<language>')
# @app.get('/api/page/<language>/<int: game_id>')
def page(language: str = 'en', game_id: Optional[int] = None):
    try:
      current_id = get_game_id()
      active_id = min(current_id if game_id is None else game_id, current_id)
      logging.info(f'Request for game with id {active_id} ({language})')

      page_name = get_game_page_name(active_id)
    except WikiError:
      logging.exception('Could not load game page')
      abort(HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
      logging.exception('Unexpected error occured')
      abort(HTTPStatus.INTERNAL_SERVER_ERROR)

    return jsonify({
      'language': language,
      'gameId': active_id,
      'page': get_page(
        page_name,
        language=language,
      ).to_json(),
    })
