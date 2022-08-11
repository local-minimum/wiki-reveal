import pytest  # type: ignore
from wiki_reveal.wiki import get_game_page_name


@pytest.mark.parametrize('game_id,page', [
    [0, 'Washing_machine'],
    [1, 'Qom'],
])
def test_get_game_page_name(game_id: int, page: str):
    assert get_game_page_name(game_id) == page
