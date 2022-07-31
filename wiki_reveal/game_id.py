from datetime import datetime, timezone
import os

START_DATE = os.environ.get('WR_EPOCH', '2022-07-29T00:00:00.000+00:00')
SECONDS_PER_DAY = 60 * 60 * 24


def get_game_id() -> int:
    now = datetime.now(tz=timezone.utc)
    start = datetime.fromisoformat(START_DATE)
    return max(0, int((now - start).total_seconds() / SECONDS_PER_DAY))
