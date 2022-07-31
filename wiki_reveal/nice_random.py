import os
from random import choice, random, seed, choices
from typing import Optional

SEED = int(os.environ.get('WR_SEED', 777))


def reset_seed():
    seed(SEED)


def get_weights(
    counts: dict[str, int],
    uses: dict[str, list[str]],
) -> dict[str, float]:
    remaining = {k: v - len(uses[k]) for k, v in counts.items()}
    total = sum(remaining.values())
    return {k: v / total for k, v in remaining.items()}


def select_category(weights: dict[str, float]) -> str:
    return choices(list(weights.keys()), list(weights.values()), k=1)[0]


def select_page(options: list[str], uses: list[str]) -> str:
    remaining = [o for o in options if o not in uses]
    return choice(remaining)


def get_option(options: dict[str, list[str]], game_id: int) -> Optional[str]:
    reset_seed()

    counts = {k: len(v) for k, v in options.items()}

    total = sum(counts.values())
    while game_id >= total:
        random()
        game_id -= total

    uses: dict[str, list[str]] = {k: [] for k in options}
    i = 0
    page = None

    while i <= game_id:
        weights = get_weights(counts, uses)
        category = select_category(weights)
        page = select_page(options[category], uses[category])
        uses[category].append(page)
        i += 1

    return page
