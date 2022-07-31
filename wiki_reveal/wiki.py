from collections.abc import Iterator
from functools import lru_cache
import json
import os
from typing import Union
from dataclasses import asdict, dataclass
import re
import logging
from typing import Tuple
from wikipediaapi import (  # type: ignore
    Wikipedia, WikipediaPage, WikipediaPageSection,
)

from wiki_reveal.exceptions import (
    FailedToSelectPageError, NoSuchPageError, ParsingFailedError,
)
from wiki_reveal.nice_random import get_option

tokenizer = re.compile(
    r'[             \t\n\r\v\f:;,.⋯…<>/\\~`\'"!?@#$%^&*()[\]{}|=+-\-–—− _→?\‑]+',  # noqa: E501
)
Token = tuple[str, bool]
Paragraph = tuple[Token, ...]


@dataclass
class Section:
    title: Paragraph
    depth: int
    paragraphs: Paragraph
    sections: tuple["Section", ...]

    def to_json(self) -> dict:
        return asdict(self)


@dataclass
class Page:
    title: Paragraph
    summary: Paragraph
    sections: tuple[Section, ...]

    def to_json(self) -> dict:
        return asdict(self)


def tokenize(data: str) -> Iterator[Token]:
    non_words = tokenizer.findall(data)
    i = 0
    non_words_count = len(non_words)

    while data and i < non_words_count:
        non_word = non_words[i]

        try:
            nw_idx = data.index(non_word)
        except (IndexError, ValueError):
            logging.error(f'Could not find "{non_word}" in "{data}" ({i})')
            raise ParsingFailedError

        if nw_idx == 0:
            yield (non_word, False)
            data = data[len(non_word):]
        else:
            yield (data[: nw_idx], True)
            yield (non_word, False)
            data = data[nw_idx + len(non_word):]
        i += 1

    if data:
        yield (data, True)


AnyWikiPart = Union[WikipediaPage, WikipediaPageSection]


def unwrap_sections(
    page: AnyWikiPart,
    *,
    depth: int = 0,
) -> Tuple[Section, ...]:
    def parse_section(section: WikipediaPageSection) -> Section:
        return Section(
            title=tuple(tokenize(section.title)),
            depth=depth,
            paragraphs=tuple(tokenize(section.text)),
            sections=unwrap_sections(section, depth=depth + 1)
        )

    return tuple(parse_section(section) for section in page.sections)


@lru_cache(maxsize=16)
def get_page(
    page_name: str,
    *,
    language: str = 'en',
) -> Page:
    wiki = Wikipedia(language)
    page = wiki.page(page_name)
    if not page.exists():
        raise NoSuchPageError

    return Page(
        title=tuple(tokenize(page.title)),
        summary=tuple(tokenize(page.summary)),
        sections=unwrap_sections(page)
    )


@lru_cache(maxsize=1)
def load_page_name_options() -> dict[str, list[str]]:
    with open(
        os.path.join(os.path.dirname(__file__), 'pages.json'),
        'r',
    ) as fh:
        return json.load(fh)


@lru_cache(maxsize=16)
def get_game_page_name(game_id: int) -> str:
    names = load_page_name_options()
    page = get_option(names, game_id)
    if page is None:
        raise FailedToSelectPageError

    return page.replace(' ', '_')
