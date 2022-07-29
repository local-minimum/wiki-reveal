import {
  Alert, Box, Grid, LinearProgress, SxProps, TableContainer, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { getPage } from '../api/page';
import useStoredValue from '../hooks/useStoredValue';
import { unmaskPage, wordAsLexicalEntry } from '../utils/wiki';
import GuessInput from './GuessInput';
import GuessTable from './GuessTable';
import Victory from './Victory';
import WikiParagraph from './WikiParagraph';
import WikiSection from './WikiSection';

/* Palette
#25283D
#8F3985
#A675A1
#CEA2AC
#EFD9CE
*/

interface VictoryType {
  guesses: number;
  hints: number;
}

function randomEntry<T>(arr: T[]): T {
  return arr[Math.min(Math.floor(Math.random() * arr.length), arr.length - 1)];
}

function WikiPage(): JSX.Element {
  const { isLoading, isError, data } = useQuery(
    ['page'],
    getPage,
  );
  const { page, freeWords, lexicon } = data ?? { lexicon: {} as Record<string, number> };
  const [guesses, setGuesses] = useStoredValue<Array<[word: string, hinted: boolean]>>('guesses', []);
  const [victory, setVictory] = useStoredValue<VictoryType | null>('victory', null);
  const [unmasked, setUnmasked] = React.useState(false);
  const [[focusWord, focusWordIndex], setFocusWord] = React
    .useState<[word: string | null, index: number]>([null, 0]);

  const focusedWordCounter = React.useRef(0);

  const focusedWordScrollToCheck = React.useCallback((): boolean => {
    const isMe = focusedWordCounter.current === 0;
    focusedWordCounter.current -= 1;
    return isMe;
  }, []);

  focusedWordCounter.current = focusWordIndex;

  const handleSetFocusWord = React.useCallback((word: string): void => {
    if (word !== focusWord) {
      focusedWordCounter.current = 0;
      setFocusWord([word, 0]);
    } else {
      setFocusWord([word, (focusWordIndex + 1) % (lexicon[word] ?? 1)]);
    }
  }, [focusWord, focusWordIndex, lexicon]);

  const revealAll = React.useCallback((): void => {
    setUnmasked(true);
  }, []);

  const { title, summary, sections } = React.useMemo(
    () => unmaskPage(
      page ?? { title: [], summary: [], sections: [] },
      guesses.map(([word]) => word),
      unmasked,
    ),
    [guesses, page, unmasked],
  );

  const hints = React.useMemo(
    () => guesses.reduce((acc, [_, isHint]) => (isHint ? acc + 1 : acc), 0),
    [guesses],
  );

  const addGuess = React.useCallback((currentGuess: string): void => {
    const entry = wordAsLexicalEntry(currentGuess);
    if (!freeWords?.includes(entry) && !guesses.some(([word]) => word === entry)) {
      setGuesses([...guesses, [entry, false]]);
      if (
        title.every(([_, isHidden, lex]) => lex === entry || !isHidden)
      ) {
        setVictory({ guesses: guesses.length - hints + 1, hints });
      }
    }
  }, [freeWords, guesses, hints, setGuesses, setVictory, title]);

  const addHint = React.useCallback((): void => {
    const maxCount = guesses
      .reduce((count, [word]) => Math.max(count, lexicon[word] ?? 0), 0);
    const options = [...Object.keys(lexicon)]
      .filter((word) => !guesses.some(([w]) => w === word)
        && !freeWords?.includes(word)
        && !title.some(([_, isHidden, lex]) => isHidden && lex === word));

    if (options.length === 0) return;

    const worthy = options.filter((word) => lexicon[word] >= maxCount * 0.9);
    if (worthy.length > 0) {
      setGuesses([...guesses, [randomEntry(worthy), true]]);
      return;
    }

    const remaining = options.sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));
    setGuesses(
      [...guesses, [randomEntry(remaining.slice(0, Math.ceil(remaining.length * 0.2))), true]],
    );
  }, [freeWords, guesses, lexicon, setGuesses, title]);

  const progress = useMemo(() => {
    const total = Object.values(lexicon).reduce((acc, count) => acc + count, 0);
    const found = [...(freeWords ?? []), ...guesses.map(([w]) => w)]
      .reduce((acc, guess) => acc + (lexicon[guess] ?? 0), 0);
    return Math.min(100, 100 * found / total);
  }, [freeWords, guesses, lexicon]);

  const commonSX: Partial<SxProps> = {
    backgroundColor: '#EFD9CE',
    color: '#25283D',
    paddingLeft: 2,
    paddingRight: 2,
    fontFamily: 'monospace',
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Grid
        container
        spacing={0}
        sx={{ height: '100%' }}
      >
        <Grid item xs={8} sx={{ height: '100vh', overflow: 'hidden', backgroundColor: '#EFD9CE' }}>
          <TableContainer sx={{ height: '100%' }}>
            {isError && <Alert severity="error">Could not load the article, perhaps try again later or wait for tomorrow</Alert>}
            <LinearProgress
              variant={isLoading ? undefined : 'determinate'}
              value={isLoading ? undefined : progress}
              sx={{ position: 'sticky', top: 0, zIndex: 100 }}
            />
            {victory !== null && (
              <Victory guesses={victory.guesses} hints={victory.hints} onRevealAll={revealAll} />
            )}
            <Typography variant="h1" sx={{ fontSize: '3rem', ...commonSX, pt: 1 }}>
              <WikiParagraph
                text={title}
                focusWord={focusWord}
                scrollToCheck={focusedWordScrollToCheck}
              />
            </Typography>
            {
              summary.map((paragraph, idx) => (
                <Typography
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  variant="body1"
                  sx={{ fontSize: '1.1rem', ...commonSX, marginTop: 1 }}
                >
                  <WikiParagraph
                    text={paragraph}
                    focusWord={focusWord}
                    scrollToCheck={focusedWordScrollToCheck}
                  />
                </Typography>
              ))
            }
            {
              sections.map((section, idx) => (
                <WikiSection
                  section={section}
                  focusWord={focusWord}
                  scrollToCheck={focusedWordScrollToCheck}
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                />
              ))
            }
          </TableContainer>
        </Grid>
        <Grid
          item
          xs={4}
          flexDirection="column"
          gap={1}
          sx={{
            p: 2, overflow: 'hidden', display: 'flex', height: '100vh',
          }}
        >
          <Typography variant="h6">
            {`${guesses.length} `}
            Guesses
          </Typography>
          <Box sx={{ height: '87vh' }}>
            <GuessTable
              focusWord={focusWord}
              guesses={guesses}
              lexicon={lexicon}
              onSetFocusWord={handleSetFocusWord}
            />
          </Box>
          <GuessInput
            isLoading={isLoading}
            isError={isError}
            isDone={progress === 100}
            unmasked={unmasked}
            hints={hints}
            onAddGuess={addGuess}
            onAddHint={addHint}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WikiPage;
