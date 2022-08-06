import os
from random import Random
from typing import Optional

_SEED = int(os.environ.get('WR_SEED', 777))


def get_seeded_random() -> Random:
    return Random(_SEED)


def get_weights(
    counts: dict[str, int],
    uses: dict[str, list[str]],
) -> dict[str, float]:
    remaining = {k: v - len(uses[k]) for k, v in counts.items()}
    total = sum(remaining.values())
    return {k: v / total for k, v in remaining.items()}


def select_category(rng: Random, weights: dict[str, float]) -> str:
    return rng.choices(list(weights.keys()), list(weights.values()), k=1)[0]


def select_page(rng: Random, options: list[str], uses: list[str]) -> str:
    remaining = [o for o in options if o not in uses]
    return rng.choice(remaining)


def get_option(options: dict[str, list[str]], game_id: int) -> Optional[str]:
    rng = get_seeded_random()

    counts = {k: len(v) for k, v in options.items()}

    total = sum(counts.values())
    while game_id >= total:
        rng.random()
        game_id -= total

    uses: dict[str, list[str]] = {k: [] for k in options}
    i = 0
    page = None

    while i <= game_id:
        weights = get_weights(counts, uses)
        category = select_category(rng, weights)
        page = select_page(rng, options[category], uses[category])
        uses[category].append(page)
        i += 1

    return page
