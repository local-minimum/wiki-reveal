from random import random
from wiki_reveal.nice_random import reset_seed

def test_reset_seed():
    reset_seed()
    v = random()
    reset_seed()
    assert v == random()
