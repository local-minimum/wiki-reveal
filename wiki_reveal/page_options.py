from functools import cache
import json
import os


@cache
def load_page_name_options() -> dict[str, list[str]]:
    with open(
        os.path.join(os.path.dirname(__file__), 'pages.json'),
        'r',
    ) as fh:
        return json.load(fh)


@cache
def get_number_of_options() -> int:
    options = load_page_name_options()
    counts = {k: len(v) for k, v in options.items()}
    return sum(counts.values())
