from typing import Any, Iterator, Optional
import re

GROUP_START = re.compile(r'{\\[a-z]+')


def get_closing(
    text: str,
    start: int = 0,
    end: Optional[int] = None,
    *,
    depth=1,
) -> str:
    if end is None:
        end = start + 1

    length = len(text)

    while end < length:
        if text[end] == '}':
            depth -= 1
            if (depth == 0):
                return text[start: end + 1]
        elif text[end] == '{':
            if (depth == 0):
                start = end
            depth += 1
        end += 1
    return text[start: end]


def clean_block(text: str) -> str:
    return text.strip().lstrip('{').rstrip('}')


def find_escaped_block(text: str) -> Iterator[tuple[str, str]]:
    end = -1
    for match in GROUP_START.finditer(text):
        start = match.start()
        if start < end:
            continue

        full = get_closing(text, start, match.end())
        end = start + len(full)

        operand = match.group()[2:]
        yield operand, full[full.find(operand) + len(operand): -1]


def _sub(text: str, content: str):
    return {
        'type': 'SUB',
        'text': text,
        'sub': clean_block(get_closing(content, depth=0)),
    }


def _sup(text: str, content: str):
    return {
        'type': 'SUP',
        'text': text,
        'sup': clean_block(get_closing(content, depth=0)),
    }


def _text(operand: str, content: str):
    return {
        'type': 'TEXT',
        'content': clean_block(content),
    }


def _null(operand: str, content: str):
    return {
        'type': operand,
        'content': parse_escape_sequence(None, content)
    }


def _frac(operand: str, content: str):
    raw_numerator = get_closing(content, depth=0)
    numerator = clean_block(raw_numerator)
    denominator_start = operand.find(raw_numerator) + len(raw_numerator) + 1
    denominator = clean_block(
        get_closing(content, denominator_start, depth=0),
    )
    return {
        'type': 'FRAC',
        'content': [
            parse_escape_sequence(None, numerator),
            parse_escape_sequence(None, denominator),
        ]
    }


def _sqrt(operand: str, content: str):
    return {
        'type': 'SQRT',
        'content': clean_block(get_closing(content, depth=0)),
    }


def _var(operand: str) -> Optional[dict[str, Any]]:
    if operand.startswith('var'):
        return {
            'type': 'VAR',
            'content': operand[3:]
        }
    return None


GREEK = {
    'pi': 'π',
}


def _greek(operand: str):
    if operand in GREEK:
        return {
            'type': 'GREEK',
            'content': GREEK[operand]
        }
    return None


OPERANDS = {
    'text': _text,
    'frac': _frac,
    'sqrt': _sqrt,
}


def parse_escape_sequence(operand: Optional[str], content: str):
    if operand:
        op = OPERANDS.get(operand.lstrip('\\'), _null)
        return op(operand, content)

    block = get_closing(content, depth=0)
    if not content.startswith(block):
        operand = content[: content.find(block)].strip()
        block = clean_block(block)
        if '\\' in operand:
            if operand.lstrip('\\') in OPERANDS:
                operand = operand.lstrip('\\')
                return OPERANDS[operand](operand, block)
            ops = re.findall(r'\\[a-z]+', operand)
            if ops:
                sub_op = ops[0].lstrip('\\')
                var = _var(sub_op)
                if var:
                    sub_op_start = operand.find(sub_op)
                    sub_op_end = sub_op_start + len(sub_op)
                    return [
                        operand[0: sub_op_start - 1].strip(),
                        var,
                        parse_escape_sequence(
                            operand[sub_op_end:].strip(),
                            block,
                        ),
                    ]
                var = _greek(sub_op)
                if var:
                    sub_op_start = operand.find(sub_op)
                    sub_op_end = sub_op_start + len(sub_op)
                    return [
                        operand[0: sub_op_start - 1].strip(),
                        var,
                        parse_escape_sequence(
                            operand[sub_op_end:].strip(),
                            block,
                        ),
                    ]
                prephase = operand[0: operand.find(sub_op) - 1]
                if prephase:
                    return [prephase, parse_escape_sequence(sub_op, block)]
                return parse_escape_sequence(sub_op, block)

        if operand.endswith('_'):
            return _sub(operand[:-1], block)
        elif operand.endswith('^'):
            return _sup(operand[:-1], block)
        return [operand, parse_escape_sequence(None, block)]

    if '\\' in content and operand is not None:
        ops = re.findall(r'\\[a-z]+', operand)
        if ops:
            sub_op = ops[0].lstrip('\\')
            prephase = operand[0: operand.find(sub_op) - 1]
            block = content[content.find(sub_op) + len(sub_op):]
            if prephase:
                return [prephase, parse_escape_sequence(sub_op, block)]
            return parse_escape_sequence(sub_op, block)

    return content.strip()
