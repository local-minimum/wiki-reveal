from wiki_reveal.nice_random import get_seeded_random


def test_reset_seed():
    rng = get_seeded_random()
    v = rng.random()
    rng = get_seeded_random()
    assert v == rng.random()
