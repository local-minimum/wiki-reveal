from collections.abc import Iterator
from .escapes import ESCAPES


def find_tags(text: str) -> Iterator[tuple[str, int]]:
    offset = 0
    while (idx := text.find('{\\')) >= 0:
        depth = 1
        start = idx
        idx += 1

        while depth > 0:
            if idx >= len(text):
                break
                
            if text[idx] == '{':
                depth += 1
            elif text[idx] == '}':
                depth -= 1
            idx += 1

        yield text[start: idx + 1], start + offset
        offset += idx + 1

        if idx + 1 >= len(text):
            break
            
        text = text[idx + 1:]


def in_tag(line: str, tag: str) -> bool:
    return line in tag or line in ESCAPES and ESCAPES[line] in tag


EQUATION_TAG = 'xxxxEQUATI0Nxxxx'


def clean_lines(text: str) -> str:
    prev_idx = 0
    out = ''
    for tag, idx in find_tags(text):
        def removable(line) -> bool:
            return line == '' or in_tag(line, tag)

        rev_lines = [
            line.strip() for line in text[prev_idx: idx].split('\n')
        ][::-1]
        line_idx = 0
        while line_idx < len(rev_lines) and removable(rev_lines[line_idx]):
            line_idx += 1

        out += '\n'.join(rev_lines[line_idx:][::-1]) + EQUATION_TAG

        prev_idx = idx + len(tag) + 1

    out += text[prev_idx:]
    return out
