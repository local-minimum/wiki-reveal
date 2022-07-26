from collections.abc import Iterator
from typing import Union
from dataclasses import asdict, dataclass
import re
import logging
from typing import Tuple
from wikipediaapi import Wikipedia, WikipediaPage, WikipediaPageSection  # type: ignore

from wiki_reveal.exceptions import NoSuchPageError, ParsingFailedError

tokenizer = re.compile(r'[             \t\n\r\v\f:;,.<>/\\~`\'"!?@#$%^&*()[\]{}|=+-\-–—− _→?\‑]+')
Token = tuple[str, bool]
Paragraph = tuple[Token, ...]


@dataclass
class Section:
    title: Paragraph
    depth: int
    paragraphs: Paragraph
    sections: tuple["Section"]

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
    l = len(non_words)

    while data and i < l:
        non_word = non_words[i]

        try:
            nw_idx = data.index(non_word)
        except:
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


def unwrap_sections(page: AnyWikiPart, *, depth: int = 0) -> Tuple[Section, ...]:
    def parse_section(section: WikipediaPageSection) -> Section:
        return Section(
            title=tuple(tokenize(section.title)),
            depth=depth,
            paragraphs=tuple(tokenize(section.text)),
            sections=unwrap_sections(section, depth=depth + 1)
        )

    return tuple(parse_section(section) for section in page.sections)


def get_page(*, language: str ='en') -> Page:
    wiki = Wikipedia(language)
    page = wiki.page('Python_(programming_language)')
    if not page.exists():
        raise NoSuchPageError

    return Page(
        title=tuple(tokenize(page.title)),
        summary=tuple(tokenize(page.summary)),
        sections=unwrap_sections(page)
    )
