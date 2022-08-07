from datetime import datetime, timezone
from typing import Any, Optional
from xmlrpc.client import boolean
from flask_socketio import close_room  # type: ignore

from wiki_reveal.game_id import SECONDS_PER_DAY

SID = Any
ROOM_DATA = tuple[datetime, int, dict[SID, str]]
ROOMS: dict[str, ROOM_DATA] = {}


def clear_old_coop_games():
    keys = tuple(ROOMS.keys())
    now = datetime.now(tz=timezone.utc)
    for key in keys:
        if (ROOMS[key][0] - now).total_seconds() > SECONDS_PER_DAY:
            del ROOMS[key]
            close_room(key)


def coop_game_exists(room: str) -> boolean:
    return room in ROOMS


def add_coop_game(room: str, game_id: int, sid: SID, username: str):
    ROOMS[room] = (datetime.now(tz=timezone.utc), game_id, {sid: username})


def add_coop_user(room: str, sid: SID, username: str) -> list[str]:
    [_, __, users] = ROOMS[room]
    users[sid] = username
    return list(users.values())


def remove_coop_user(room: str, sid: SID) -> tuple[Optional[str], list[str]]:
    [_, __, users] = ROOMS[room]
    username = users.get(sid)
    del users[sid]
    return username, list(users.values())


def rename_user(room: str, sid: SID, username: str):
    [_, __, users] = ROOMS[room]
    users[sid] = username
    # TODO: update guess list
