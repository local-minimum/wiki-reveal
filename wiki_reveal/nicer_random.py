from functools import cache
from random import Random
from typing import Iterator
import os

from wiki_reveal.page_options import load_page_name_options

_SEED = int(os.environ.get('WR_SEED', 777))


@cache
def randomize_titles() -> list[str]:
    rng = Random(_SEED)
    titles = load_page_name_options()
    categorized = [list(v) for v in titles.values()]
    tuple(map(rng.shuffle, categorized))
    counts = [len(v) for v in categorized]

    def generator() -> Iterator[str]:
        total = sum(counts)
        categories = len(counts)
        last_category = -1

        while total > 0:
            i = rng.randint(0, total - 1)
            c = rng.randint(0, categories - 1)
            while i >= (
                n := counts[c] if c != last_category else counts[c] * 0.5
            ):
                i -= int(n)
                c += 1
                c %= categories

            title = categorized[c].pop()
            counts[c] -= 1
            total -= 1

            if (counts[c] == 0):
                del counts[c]
                del categorized[c]
                last_category = -1
                categories -= 1
            else:
                last_category = c

            yield title

    return list(generator())
