from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Optional
from xmlrpc.client import boolean
from flask_socketio import close_room  # type: ignore
from wiki_reveal.exceptions import CoopGameDoesNotExistError

from wiki_reveal.game_id import SECONDS_PER_DAY, get_end_of_current

SID = Any
GUESS = list[str]
ROOM_DATA = tuple[
    datetime,
    Optional[datetime],
    int,
    dict[SID, str],
    list[GUESS]
]
ROOMS: dict[str, ROOM_DATA] = {}


def clear_old_coop_games():
    keys = tuple(ROOMS.keys())
    now = datetime.now(tz=timezone.utc)
    for key in keys:
        start, end, _, __, ___ = ROOMS[key]
        if (
            (start - now).total_seconds() > SECONDS_PER_DAY
            or (
                end is not None
                and (end - now).total_seconds() < 0
            )
        ):
            del ROOMS[key]
            close_room(key)


def coop_game_exists(room: str) -> boolean:
    return room in ROOMS


def coop_game_is_full(room: str) -> boolean:
    _, __, ___, users, ____ = ROOMS[room]
    return len(users) < 16


def add_coop_game(
    room: str,
    game_id: int,
    sid: SID,
    username: str,
    start: Optional[datetime] = None,
    duration: Optional[int] = None
):
    start = datetime.now(tz=timezone.utc) if start is None else start
    ROOMS[room] = (
        start,
        (
            get_end_of_current()
            if duration is None
            else start + timedelta(hours=duration)
        ),
        game_id,
        {sid: username},
        [],
    )


def add_coop_user(room: str, sid: SID, username: str) -> list[str]:
    if not coop_game_exists(room):
        logging.error('Attempted to add user to a non-existing rom')
        return []

    _, __, ___, users, ____ = ROOMS[room]
    users[sid] = username
    return list(users.values())


def remove_coop_user(room: str, sid: SID) -> tuple[Optional[str], list[str]]:
    if not coop_game_exists(room):
        return None, []

    _, __, ___, users, ____ = ROOMS[room]
    username = users.get(sid)
    del users[sid]
    return username, list(users.values())


def rename_user(room: str, sid: SID, username: str):
    if not coop_game_exists(room):
        return

    _, __, ___, users, guesses = ROOMS[room]
    old_name = users.get('sid')
    users[sid] = username

    if old_name is not None:
        for guess in guesses:
            ____, user = guess
            if user == old_name:
                guess[1] = username


def get_room_data(room: str) -> tuple[datetime, Optional[datetime], int]:
    if not coop_game_exists(room):
        raise CoopGameDoesNotExistError

    start, end, game_id, _, __ = ROOMS[room]
    return start, end, game_id


def add_coop_guess(room: str, username: str, lex: str) -> int:
    if not coop_game_exists(room):
        raise CoopGameDoesNotExistError

    _, __, ___, ____, guesses = ROOMS[room]
    if any(guess == lex for guess, _ in guesses):
        return -1

    guesses.append([lex, username])
    return len(guesses) - 1
