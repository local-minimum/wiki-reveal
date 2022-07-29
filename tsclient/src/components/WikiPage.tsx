import { faPlay, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert, Button, Grid, LinearProgress, Stack, SxProps, TextField, Tooltip, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { getPage } from '../api/page';
import { unmaskPage, wordAsLexicalEntry } from '../utils/wiki';
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
  const [guesses, setGuesses] = React.useState<Array<[word: string, hinted: boolean]>>([]);
  const [victory, setVictory] = React.useState<VictoryType | null>(null);
  const [unmasked, setUnmasked] = React.useState(false);
  const [currentGuess, setCurrentGuess] = React.useState('');

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

  const addGuess = React.useCallback((): void => {
    if (currentGuess !== '') {
      const entry = wordAsLexicalEntry(currentGuess);
      if (!freeWords?.includes(entry) && !guesses.some(([word]) => word === entry)) {
        setGuesses([...guesses, [entry, false]]);
        if (
          title.every(([_, isHidden, lex]) => lex === entry || !isHidden)
        ) {
          setVictory({ guesses: guesses.length - hints + 1, hints });
        }
      }
    }
    setCurrentGuess('');
  }, [currentGuess, freeWords, guesses, hints, title]);

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
  }, [freeWords, guesses, lexicon, title]);

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
  };

  return (
    <Grid
      container
      spacing={0}
      sx={{
        w: '100%',
        h: '100%',
      }}
    >
      <Grid item xs={8}>
        {isError && <Alert severity="error">Could not load the article, perhaps try again later or wait for tomorrow</Alert>}
        <LinearProgress variant={isLoading ? undefined : 'determinate'} value={isLoading ? undefined : progress} />
        {victory !== null && (
          <Victory guesses={victory.guesses} hints={victory.hints} onRevealAll={revealAll} />
        )}
        <Typography variant="h1" sx={{ fontSize: '3rem', ...commonSX, pt: 1 }}>
          <WikiParagraph text={title} />
        </Typography>
        {
          summary.map((paragraph, idx) => (
            <Typography
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              variant="body1"
              sx={{ fontSize: '1.1rem', ...commonSX, marginTop: 1 }}
            >
              <WikiParagraph text={paragraph} />
            </Typography>
          ))
        }
        {
          // eslint-disable-next-line react/no-array-index-key
          sections.map((section, idx) => <WikiSection section={section} key={idx} />)
        }
      </Grid>
      <Grid item xs={4} sx={{ p: 2 }}>
        <Typography variant="h6">
          {`${guesses.length} `}
          Guesses
          <GuessTable guesses={guesses} lexicon={lexicon} />
        </Typography>
        <Stack direction="row" gap={1}>
          <Tooltip title="Enter guess">
            <TextField
              sx={{ flex: 1 }}
              disabled={isLoading || isError || progress === 100 || unmasked}
              variant="outlined"
              focused
              value={currentGuess}
              onChange={({ target: { value } }) => setCurrentGuess(value)}
              onKeyDown={({ key }) => {
                if (key === 'Enter') addGuess();
              }}
            />
          </Tooltip>
          <Tooltip title="Submit guess">
            <Button
              variant="contained"
              onClick={addGuess}
              startIcon={<FontAwesomeIcon icon={faPlay} />}
              disabled={currentGuess.length === 0 || progress === 100 || unmasked}
            >
              Submit
            </Button>
          </Tooltip>
          <Tooltip title="Get a word for free that is not in the main header">
            <Button
              variant="contained"
              onClick={addHint}
              startIcon={<FontAwesomeIcon icon={faPuzzlePiece} />}
              disabled={progress === 100 || unmasked}
            >
              {`${hints} Hint${hints === 1 ? '' : 's'}`}
            </Button>
          </Tooltip>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default WikiPage;
