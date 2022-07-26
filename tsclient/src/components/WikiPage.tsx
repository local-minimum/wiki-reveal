import {
  Alert, Box, LinearProgress, Stack, SxProps, TextField, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { getPage } from '../api/page';
import { unmaskPage, wordAsLexicalEntry } from '../utils/wiki';
import WikiParagraph from './WikiParagraph';
import WikiSection from './WikiSection';

/* Palette
#25283D
#8F3985
#A675A1
#CEA2AC
#EFD9CE
*/

function WikiPage(): JSX.Element {
  const { isLoading, isError, data } = useQuery(
    ['page'],
    getPage,
  );
  const { page, freeWords, lexicon } = data ?? {};

  const [guesses, setGuesses] = React.useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = React.useState('');

  const addGuess = React.useCallback((): void => {
    if (currentGuess !== '') {
      const entry = wordAsLexicalEntry(currentGuess);
      if (!freeWords?.some((w) => w === entry) && !guesses.some((w) => w === entry)) {
        setGuesses([...guesses, entry]);
      }
    }
    setCurrentGuess('');
  }, [currentGuess, freeWords, guesses]);

  const { title, summary, sections } = React.useMemo(
    () => unmaskPage(page ?? { title: [], summary: [], sections: [] }, guesses),
    [guesses, page],
  );

  const progress = useMemo(() => {
    const total = Object.values(lexicon ?? {}).reduce((acc, count) => acc + count, 0);
    const found = [...(freeWords ?? []), ...guesses]
      .reduce((acc, guess) => acc + (lexicon?.[guess] ?? 0), 0);
    return 100 * found / total;
  }, [freeWords, guesses, lexicon]);

  const commonSX: Partial<SxProps> = {
    backgroundColor: '#EFD9CE',
    color: '#25283D',
    paddingLeft: 2,
    paddingRight: 2,
  };

  return (
    <Stack
      component="div"
      sx={{
        w: '100%',
        h: '100%',
      }}
    >
      {isError && <Alert severity="error">Could not load the article, perhaps try again later or wait for tomorrow</Alert>}
      <LinearProgress variant={isLoading ? undefined : 'determinate'} value={isLoading ? undefined : progress} />
      <Box>
        <TextField
          sx={{ minWidth: '30em' }}
          disabled={isLoading || isError}
          variant="outlined"
          focused
          value={currentGuess}
          onChange={({ target: { value } }) => setCurrentGuess(value)}
          onKeyDown={({ key }) => {
            if (key === 'Enter') addGuess();
          }}
        />
      </Box>
      <Stack direction="row">
        <Box sx={{ w: '70%', p: 1 }} component="div">
          <Typography variant="h1" sx={{ fontSize: '3rem', ...commonSX }}>
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
        </Box>
      </Stack>
    </Stack>
  );
}

export default WikiPage;
