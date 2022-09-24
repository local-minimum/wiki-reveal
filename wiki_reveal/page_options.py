from functools import cache
import json
import os

from wiki_reveal.about import get_json_filename


@cache
def load_page_name_options() -> dict[str, list[str]]:
    with open(
        os.path.join(
            os.path.dirname(__file__),
            get_json_filename('pages', os.environ.get('WR_PAGES')),
        ),
        'r',
    ) as fh:
        return json.load(fh)


@cache
def get_number_of_options() -> int:
    options = load_page_name_options()
    counts = {k: len(v) for k, v in options.items()}
    return sum(counts.values())
