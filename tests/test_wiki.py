import pytest  # type: ignore
from wiki_reveal.wiki import get_game_page_name


@pytest.mark.parametrize('game_id,page', [
    [0, 'Yves_Saint_Laurent_(designer)'],
    [1, 'Variable_(mathematics)'],
])
def test_get_game_page_name(game_id: int, page: str):
    assert get_game_page_name(game_id) == page
