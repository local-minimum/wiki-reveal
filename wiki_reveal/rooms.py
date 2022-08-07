from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Optional
from xmlrpc.client import boolean
from flask_socketio import close_room
from wiki_reveal.exceptions import CoopGameDoesNotExistError  # type: ignore

from wiki_reveal.game_id import SECONDS_PER_DAY, get_end_of_current

SID = Any
ROOM_DATA = tuple[datetime, Optional[datetime], int, dict[SID, str]]
ROOMS: dict[str, ROOM_DATA] = {}


def clear_old_coop_games():
    keys = tuple(ROOMS.keys())
    now = datetime.now(tz=timezone.utc)
    for key in keys:
        start, end, _, __ = ROOMS[key]
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
    )


def add_coop_user(room: str, sid: SID, username: str) -> list[str]:
    if not coop_game_exists(room):
        logging.error('Attempted to add user to a non-existing rom')
        return []

    _, __, ___, users = ROOMS[room]
    users[sid] = username
    return list(users.values())


def remove_coop_user(room: str, sid: SID) -> tuple[Optional[str], list[str]]:
    if not coop_game_exists(room):
        return None, []

    _, __, ___, users = ROOMS[room]
    username = users.get(sid)
    del users[sid]
    return username, list(users.values())


def rename_user(room: str, sid: SID, username: str):
    if not coop_game_exists(room):
        return

    _, __, ___, users = ROOMS[room]
    users[sid] = username
    # TODO: update guess list


def get_room_data(room: str) -> tuple[datetime, Optional[datetime], int]:
    if not coop_game_exists(room):
        raise CoopGameDoesNotExistError

    start, end, game_id, _ = ROOMS[room]
    return start, end, game_id
