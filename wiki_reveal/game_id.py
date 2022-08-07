from datetime import datetime, timezone, timedelta
import os

START_DATE = os.environ.get('WR_EPOCH', '2022-07-29T00:00:00.000+00:00')
SECONDS_PER_DAY = 60 * 60 * 24


def get_game_id() -> int:
    now = datetime.now(tz=timezone.utc)
    epoch = datetime.fromisoformat(START_DATE)
    return max(0, int((now - epoch).total_seconds() / SECONDS_PER_DAY))


def get_start_and_end(game_id: int) -> tuple[str, str]:
    epoch = datetime.fromisoformat(START_DATE)
    start = epoch + timedelta(days=game_id)
    end = start + timedelta(days=1)
    return (
        start.isoformat().replace(' ', 'T'),
        end.isoformat().replace(' ', 'T')
    )


def get_start_of_current() -> datetime:
    game_id = get_game_id()
    epoch = datetime.fromisoformat(START_DATE)
    return epoch + timedelta(days=game_id)


def get_end_of_current() -> datetime:
    return get_start_of_current() + timedelta(days=1)
