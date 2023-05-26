from collections.abc import Iterator
from functools import lru_cache
from typing import Union
from dataclasses import asdict, dataclass
import re
import logging
import requests
from typing import Optional
from requests.exceptions import JSONDecodeError
from wikipediaapi import (  # type: ignore
    Wikipedia, WikipediaPage, WikipediaPageSection,
)

from wiki_reveal.exceptions import (
    FailedToSelectPageError, NoSuchPageError, ParsingFailedError,
)
from wiki_reveal.nicer_random import randomize_titles
from wiki_reveal.parser import EQUATION_TAG, clean_lines

tokenizer = re.compile(
    r'[             \t\n\r\v\f:;,.⋯…<>/\\~`\'ˈ"!?@#$%^&*°()[\]{}|=+-\-–—− _→?\‑]+',  # noqa: E501
)
Token = tuple[Optional[str], bool]
Paragraph = tuple[Token, ...]

logging.info('Preloading ranomized articles')
randomize_titles()
logging.info('Article order preloaded')


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
    data = clean_lines(data)
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
            token = data[: nw_idx]
            if EQUATION_TAG == token:
                yield (None, False)
            elif EQUATION_TAG in token:
                for part in token.split(EQUATION_TAG):
                    if part:
                        yield (part, True)
                    else:
                        yield (None, False)
            else:
                yield (token, True)
            yield (non_word, False)
            data = data[nw_idx + len(non_word):]
        i += 1

    if data:
        if EQUATION_TAG == data:
            yield (None, False)
        elif EQUATION_TAG in data:
            for part in data.split(EQUATION_TAG):
                if part:
                    yield (part, True)
                else:
                    yield (None, False)
        else:
            yield (data, True)


AnyWikiPart = Union[WikipediaPage, WikipediaPageSection]


def unwrap_sections(
    page: AnyWikiPart,
    *,
    depth: int = 0,
) -> tuple[Section, ...]:
    def parse_section(section: WikipediaPageSection) -> Section:
        return Section(
            title=tuple(tokenize(section.title)),
            depth=depth,
            paragraphs=tuple(tokenize(section.text)),
            sections=unwrap_sections(section, depth=depth + 1)
        )

    return tuple(parse_section(section) for section in page.sections)



def patch_session(wiki: Wikipedia) -> bool:
    if not hasattr(wiki, '_session'):
        return False

    if not 'requests.sessions.Session' in repr(wiki._session):
        return False

    logging.info('Patched in new session')
    wiki._session = requests.session()
    return True


@lru_cache(maxsize=256)
def get_page(
    page_name: str,
    *,
    language: str = 'en',
) -> Page:
    wiki = Wikipedia(language)
    page = wiki.page(page_name)
    try:
        if not page.exists():
            raise NoSuchPageError
    except JSONDecodeError:
        logging.error(f"Failed to load '{page_name}'")

        if patch_session(wiki):
            page = wiki.page(page_name)
        else:
            raise NoSuchPageError

    return Page(
        title=tuple(tokenize(page.title.replace('_', ' '))),
        summary=tuple(tokenize(page.summary)),
        sections=unwrap_sections(page)
    )


@lru_cache(maxsize=256)
def get_game_page_name(game_id: int) -> str:
    options = randomize_titles()
    page = options[game_id % len(options)]
    if page is None:
        raise FailedToSelectPageError

    return page.replace(' ', '_')
