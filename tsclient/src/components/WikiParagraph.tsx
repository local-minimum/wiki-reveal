import { styled } from '@mui/system';
import * as React from 'react';

import { LexicalizedToken } from '../types/wiki';

interface WikiParagraphProps {
  text: LexicalizedToken[] | undefined;
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

function WikiParagraph({ text }: WikiParagraphProps): JSX.Element | null {
  if (text === undefined) return null;

  return (
    <>
      {
        // eslint-disable-next-line react/no-array-index-key
        text.map(([token, isHidden], idx) => (isHidden ? <WordBlock word={token} key={`${idx}`} /> : token))
      }
    </>
  );
}

export default WikiParagraph;
