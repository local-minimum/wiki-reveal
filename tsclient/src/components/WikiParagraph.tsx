import { styled } from '@mui/system';
import * as React from 'react';

import { LexicalizedToken } from '../types/wiki';

const EquationSpan = styled('span')({
  fontFamily: 'ui-monospace, monospace',
  borderWidth: '2px',
  borderStyle: 'dotted',
  borderRadius: '1px',
  color: '#8F3985',
  borderColor: '#25283D',
  fontSize: '75%',
  fontWeight: 'bold',
  marginLeft: 2,
  marginRight: 2,
  paddingLeft: 2,
  paddingRight: 2,
  paddingTop: 2,
  paddingBottom: 1,
});

function Equation(): JSX.Element {
  return (
    <EquationSpan>
      EXPRESSION
    </EquationSpan>
  );
}

interface WordBlockProps {
  word: string | null;
  numberHint: boolean;
}

const BlockedNumberHint = styled('span')({
  color: '#CEA2AC',
  backgroundColor: '#25283D',
  fontFamily: 'ui-monospace, monospace',
});

const Blocked = styled('span')({
  color: '#25283D',
  backgroundColor: '#25283D',
  fontFamily: 'ui-monospace, monospace',
});

function lengthBlock(word: string, filler = '█'): [string, string] {
  const lengthText = word.length.toString();
  const rest = filler.repeat(word.length - lengthText.length);
  return [lengthText, rest];
}

export function WordBlock({ word, numberHint }: WordBlockProps): JSX.Element {
  if (word === null) return <Equation />;
  if (numberHint && word.length > 3) {
    const [hint, rest] = lengthBlock(word);
    return (
      <>
        <BlockedNumberHint>{hint}</BlockedNumberHint>
        <Blocked>{rest}</Blocked>
      </>
    );
  }
  return <Blocked>{'█'.repeat(word.length)}</Blocked>;
}

interface WordBlockHiddenProps {
  word: string;
}

const BlockedHidden = styled('span')({
  backgroundColor: '#8F3985',
  fontFamily: 'ui-monospace, monospace',
});

export function WordBlockHidden({ word }: WordBlockHiddenProps): JSX.Element {
  return (
    <BlockedHidden>{'\u00A0'.repeat(word.length)}</BlockedHidden>
  );
}

const Focused = styled('span')({
  backgroundColor: '#CEA2AC',
  margin: -3,
  padding: 3,
  fontFamily: 'ui-monospace, monospace',
});

const ScrolledTo = styled('span')({
  backgroundColor: '#8F3985',
  color: '#EFD9CE',
  margin: -3,
  padding: 3,
  fontFamily: 'ui-monospace, monospace',
});

interface RevealedWordProps {
  word: string | null;
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

  if (word === null) return <Equation />;
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
  numberHints: boolean;
}

function WikiParagraph({
  text, focusWord, scrollToCheck, hideWords, masked = true, isHeader = false, numberHints = false,
}: WikiParagraphProps): JSX.Element | null {
  if (text === undefined) return null;

  return (
    <>
      {
        text.map(([token, isHidden, lex], idx) => {
          if (lex === null || token === null) return <Equation />;

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
              ? <WordBlock word={token} key={idx} numberHint={numberHints} />
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
