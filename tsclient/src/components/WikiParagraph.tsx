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

export function WordBlock({ word }: WordBlockProps): JSX.Element {
  return (
    <Blocked>{word.replace(regex, '\u00A0')}</Blocked>
  );
}

interface WordBlockHiddenProps {
  word: string;
}

const BlockedHidden = styled('span')({
  backgroundColor: '#8F3985',
  fontFamily: 'monospace',
});

export function WordBlockHidden({ word }: WordBlockHiddenProps): JSX.Element {
  return (
    <BlockedHidden>{word.replace(regex, '\u00A0')}</BlockedHidden>
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

export function RevealedWord({ word, focused, scrollTo }: RevealedWordProps): JSX.Element {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    if (scrollTo) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [scrollTo]);

  if (scrollTo) return <ScrolledTo ref={ref}>{word}</ScrolledTo>;
  if (focused) return <Focused>{word}</Focused>;
  return <span>{word}</span>;
}

interface WikiParagraphProps {
  text: LexicalizedToken[] | undefined;
  focusWord: string | null;
  scrollToCheck: (isHeader: boolean) => boolean;
  hideWords?: string[];
  masked?: boolean;
  isHeader?: boolean;
}

function WikiParagraph({
  text, focusWord, scrollToCheck, hideWords, masked = true, isHeader = false,
}: WikiParagraphProps): JSX.Element | null {
  if (text === undefined) return null;

  return (
    <>
      {
        text.map(([token, isHidden, lex], idx) => {
          const focused = lex === focusWord;
          if (hideWords?.includes(lex)) {
            return (
              <WordBlockHidden
                word={token}
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
              />
            );
          }
          return (
            isHidden && masked
              // eslint-disable-next-line react/no-array-index-key
              ? <WordBlock word={token} key={idx} />
              : (
                <RevealedWord
                  word={token}
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  focused={focused}
                  scrollTo={focused && scrollToCheck(isHeader)}
                />
              )
          );
        })
      }
    </>
  );
}

export default WikiParagraph;
