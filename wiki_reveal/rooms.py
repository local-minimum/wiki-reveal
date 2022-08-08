from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import logging
from operator import attrgetter
from random import Random
from time import time
from typing import Any, Literal, Optional, Tuple, Union, cast
from flask_socketio import close_room  # type: ignore
from wiki_reveal.exceptions import CoopGameDoesNotExistError

from wiki_reveal.game_id import SECONDS_PER_DAY, get_end_of_current

SID = str
GUESS = list[str]
ROOM_ATTRIBUTE = Literal['start', 'end', 'game_id', 'rng_seed', 'users', 'guesses']


@dataclass
class RoomData:
    start: datetime
    end: datetime
    game_id: int
    rng_seed: Optional[int]
    users: dict[SID, str]
    guesses: list[GUESS]


ROOMS: dict[str, RoomData] = {}


def dest(room_data: RoomData, *attrs: ROOM_ATTRIBUTE) -> Union[Tuple[Any], Any]:
    """Just returns the single attribute if one is requested, or all as a tuple"""
    return attrgetter(*attrs)(room_data)


def clear_old_coop_games():
    keys = tuple(ROOMS.keys())
    now = datetime.now(tz=timezone.utc)
    for key in keys:
        start, end = cast(
            tuple[datetime, datetime],
            dest(ROOMS[key], 'start', 'end'),
        )
        if (
            (start - now).total_seconds() > SECONDS_PER_DAY
            or (
                end is not None
                and (end - now).total_seconds() < 0
            )
        ):
            del ROOMS[key]
            close_room(key)


def coop_game_exists(room: str) -> bool:
    return room in ROOMS


def coop_game_is_full(room: str) -> bool:
    users = ROOMS[room].users
    return len(users) >= 16


def add_coop_game(
    room: str,
    game_id: int,
    use_rng_seed: bool,
    sid: SID,
    username: str,
    start: Optional[datetime] = None,
    duration: Optional[int] = None
):
    start = datetime.now(tz=timezone.utc) if start is None else start
    rng_seed = None if not use_rng_seed else Random(time()).randint(0, 100000)
    ROOMS[room] = RoomData(
        start=start,
        end = (
            get_end_of_current()
            if duration is None
            else start + timedelta(hours=duration)
        ),
        game_id=game_id,
        rng_seed=rng_seed,
        users={sid: username},
        guesses=[],
    )


def add_coop_user(
    room: str,
    sid: SID,
    username: str,
) -> tuple[list[str], list[GUESS]]:
    if not coop_game_exists(room):
        logging.error('Attempted to add user to a non-existing rom')
        return [], []

    users, guesses = cast(
        tuple[dict[SID, str], list[GUESS]],
        dest(ROOMS[room], 'users', 'guesses'),
    )

    # Remove others with same name
    for key in list(users.keys()):
        if users[key] == username:
            del users[key]

    users[sid] = username
    return list(users.values()), guesses


def remove_coop_user(room: str, sid: SID) -> tuple[Optional[str], list[str]]:
    if not coop_game_exists(room):
        return None, []

    users = ROOMS[room].users
    username = users.get(sid)
    del users[sid]
    return username, list(users.values())


def rename_user(room: str, sid: SID, username: str):
    if not coop_game_exists(room):
        return

    users, guesses = cast(
        tuple[dict[SID, str], list[GUESS]],
        dest(ROOMS[room], 'users', 'guesses'),
    )
    old_name = users.get('sid')
    users[sid] = username

    if old_name is not None:
        for guess in guesses:
            ____, user = guess
            if user == old_name:
                guess[1] = username


def get_room_data(room: str) -> tuple[datetime, Optional[datetime], int, Optional[int]]:
    if not coop_game_exists(room):
        raise CoopGameDoesNotExistError

    return cast(
        tuple[datetime, datetime, int, Optional[int]],
        dest(ROOMS[room], 'start', 'end', 'game_id', 'rng_seed'),
    )


def add_coop_guess(room: str, username: str, lex: str) -> int:
    if not coop_game_exists(room):
        raise CoopGameDoesNotExistError

    guesses = ROOMS[room].guesses
    if any(guess == lex for guess, _ in guesses):
        return -1

    guesses.append([lex, username])
    return len(guesses) - 1
