import { styled } from '@mui/system';
import * as React from 'react';

import { LexicalizedToken } from '../types/wiki';

interface WordBlockProps {
  word: string;
}

const Blocked = styled('span')({
  backgroundColor: '#25283D',
  fontFamily: 'monospace',
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
  fontFamily: 'monospace',
});

const ScrolledTo = styled('span')({
  backgroundColor: '#8F3985',
  color: '#EFD9CE',
  margin: -3,
  padding: 3,
  fontFamily: 'monospace',
});

interface RevealedWordProps {
  word: string;
  focused: boolean;
  scrollTo: boolean;
}

function RevealedWord({ word, focused, scrollTo }: RevealedWordProps): JSX.Element {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    if (scrollTo) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [scrollTo]);

  if (!focused) return <span>{word}</span>;
  if (scrollTo) return <ScrolledTo ref={ref}>{word}</ScrolledTo>;
  return <Focused>{word}</Focused>;
}

interface WikiParagraphProps {
  text: LexicalizedToken[] | undefined;
  focusWord: string | null;
  scrollToCheck: () => boolean;
}

function WikiParagraph({
  text, focusWord, scrollToCheck,
}: WikiParagraphProps): JSX.Element | null {
  if (text === undefined) return null;

  return (
    <>
      {
        text.map(([token, isHidden, lex], idx) => {
          const focused = lex === focusWord;
          return (
            isHidden
              // eslint-disable-next-line react/no-array-index-key
              ? <WordBlock word={token} key={`${idx}`} />
              // eslint-disable-next-line react/no-array-index-key
              : <RevealedWord word={token} key={`${idx}`} focused={focused} scrollTo={focused && scrollToCheck()} />
          );
        })
      }
    </>
  );
}

export default WikiParagraph;
