import { styled } from '@mui/system';
import * as React from 'react';

import { LexicalizedToken } from '../types/wiki';

interface WikiParagraphProps {
  text: LexicalizedToken[] | undefined;
  focusWord: string | null;
}

interface WordBlockProps {
  word: string;
}

const Blocked = styled('span')({
  backgroundColor: '#25283D',
});
const regex = /./gi;

function WordBlock({ word }: WordBlockProps): JSX.Element {
  return (
    <Blocked>{word.replace(regex, '\u00A0')}</Blocked>
  );
}

const Focused = styled('span')({
  backgroundColor: '#CEA2AC',
  margin: -3,
  padding: 3,
});

interface RevealedWordProps {
  word: string;
  focused: boolean;
}

function RevealedWord({ word, focused }: RevealedWordProps): JSX.Element {
  if (!focused) return <span>{word}</span>;
  return <Focused>{word}</Focused>;
}

function WikiParagraph({ text, focusWord }: WikiParagraphProps): JSX.Element | null {
  if (text === undefined) return null;

  return (
    <>
      {
        text.map(([token, isHidden, lex], idx) => (
          isHidden
            // eslint-disable-next-line react/no-array-index-key
            ? <WordBlock word={token} key={`${idx}`} />
            // eslint-disable-next-line react/no-array-index-key
            : <RevealedWord word={token} key={`${idx}`} focused={lex === focusWord} />
        ))
      }
    </>
  );
}

export default WikiParagraph;
