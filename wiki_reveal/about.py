from functools import cache
import json


import os
from typing import Any, Optional


def get_json_filename(prefix: str, variant: Optional[str]) -> str:
    if variant:
        return f"{prefix}.{variant}.json"
    return f"{prefix}.json"


@cache
def get_about() -> dict[str, Any]:
    with open(
        os.path.join(
            os.path.dirname(__file__),
            get_json_filename('about', os.environ.get('WR_PAGES')),
        ),
        'r',
    ) as fh:
        return json.load(fh)