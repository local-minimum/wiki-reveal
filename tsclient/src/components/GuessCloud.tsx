import React, { useCallback, useMemo } from 'react';
import ReactWordcloud, { Options, Word } from 'react-wordcloud';
import { Guess } from './Guess';

interface GuessCloudProps {
  guesses: Array<Guess>;
  lexicon: Record<string, number>;
  titleLexes: string[];
  headingLexes: string[];
  fullScreen?: boolean;
}

const wordCloudOptions: Partial<Options> = {
  rotations: 0,
  fontSizes: [8, 42],
  enableTooltip: false,
};

const missingColor = '#CEA2AC';
const normalColor = '#25283D';
const headingColor = '#8F3985';
const titleColor = '#8F3985';

function GuessCloud({
  guesses,
  lexicon,
  titleLexes,
  headingLexes,
  fullScreen = false,
}: GuessCloudProps): JSX.Element {
  const words = useMemo(() => guesses
    .map(([lex]) => ({ text: lex, value: lexicon[lex] ?? 0 }))
    .filter((word) => word.text !== ''), [guesses, lexicon]);

  const wordColorer = useCallback((word: Word) => {
    if (titleLexes.includes(word.text)) return titleColor;
    if (headingLexes.includes(word.text)) return headingColor;
    if (lexicon[word.text] == null) return missingColor;
    return normalColor;
  }, [headingLexes, lexicon, titleLexes]);

  return useMemo(() => (
    <ReactWordcloud
      words={words}
      maxWords={fullScreen ? 200 : 100}
      options={wordCloudOptions}
      callbacks={{
        getWordColor: wordColorer,
      }}
    />
  ), [fullScreen, wordColorer, words]);
}

export default GuessCloud;
