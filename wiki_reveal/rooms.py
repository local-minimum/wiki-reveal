from datetime import datetime, timezone
from flask_socketio import close_room  # type: ignore

from wiki_reveal.game_id import SECONDS_PER_DAY

ROOM_DATA = tuple[datetime, int, list[str]]
ROOMS: dict[str, ROOM_DATA] = {}


def clear_old_coop_games():
    keys = tuple(ROOMS.keys())
    now = datetime.now(tz=timezone.utc)
    for key in keys:
        if (ROOMS[key][0] - now).total_seconds() > SECONDS_PER_DAY:
            del ROOMS[key]
            close_room(key)


def add_coop_game(room: str, game_id: int, username: str):
    ROOMS[room] = (datetime.now(tz=timezone.utc), game_id, [username])


def add_coop_user(room: str, username: str) -> list[str]:
    [_, __, users] = ROOMS[room]
    users.append(username)
    return users


def remove_coop_user(room: str, username: str):
    [_, __, users] = ROOMS[room]
    users.remove(username)
    return users
