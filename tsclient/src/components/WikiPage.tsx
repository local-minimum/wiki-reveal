import {
  Box, Grid, LinearProgress, TableContainer, Tooltip, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useMemo } from 'react';

import useClearStoredValues from '../hooks/useClearStoredValues';
import useStoredValue from '../hooks/useStoredValue';
import { LexicalizedToken, Page } from '../types/wiki';
import {
  Achievement,
  AchievementsType, achievementToTitle, checkAchievementsPercent, checkRankAchievements,
  checkRevealAchievements, checkVictoryAchievements, updateAchievements,
} from '../utils/achievements';
import { unmaskPage, wordAsLexicalEntry } from '../utils/wiki';
import GuessInput from './GuessInput';
import GuessTable from './GuessTable';
import LoadFail from './LoadFail';
import RedactedPage from './RedactedPage';
import SiteMenu from './SiteMenu';
import Victory from './Victory';
import { VictoryType } from './VictoryType';

function randomEntry<T>(arr: T[]): T {
  return arr[Math.min(Math.floor(Math.random() * arr.length), arr.length - 1)];
}

const CASH_KEYS = ['guesses', 'victory', 'start'];

interface WikiPageProps {
  isLoading: boolean;
  isError: boolean;
  freeWords: string[] | undefined;
  lexicon: Record<string, number>,
  gameId: number | undefined;
  language: string | undefined;
  pageName: string | undefined;
  page: Page | undefined;
  titleLexes: string[];
  headingLexes: string[];
  yesterdaysTitle: LexicalizedToken[] | undefined;
  start: Date | undefined;
  end: Date | undefined;
}

function calculateProgress(
  lexicon: Record<string, number>,
  freeWords: string[] | undefined,
  guesses: Array<[string, boolean]>,
): number {
  const total = Object.values(lexicon).reduce((acc, count) => acc + count, 0);
  const found = [...(freeWords ?? []), ...guesses.map(([w]) => w)]
    .reduce((acc, guess) => acc + (lexicon[guess] ?? 0), 0);
  return Math.min(100, 100 * found / total);
}

function calculateAccuracy(
  lexicon: Record<string, number>,
  guesses: Array<[string, boolean]>,
): number {
  const trueGuesses = guesses.filter(([, hinted]) => !hinted);
  if (trueGuesses.length === 0) return 0;

  return 100
    * trueGuesses.filter(([word]) => (lexicon[word] ?? 0) > 0).length
    / trueGuesses.length;
}

function WikiPage({
  isLoading, isError, freeWords, lexicon, gameId, language, pageName, page,
  titleLexes, headingLexes, yesterdaysTitle, start, end,
}: WikiPageProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const reportAchievement = React.useCallback((achievement: Achievement): void => {
    enqueueSnackbar(
      (
        <>
          <strong>Achievement: </strong>
          {achievementToTitle(achievement)[0]}
        </>
      ),
      { variant: 'success' },
    );
  }, [enqueueSnackbar]);

  const [guesses, setGuesses] = useStoredValue<Array<[word: string, hinted: boolean]>>(`guesses-${gameId}`, []);
  const [victory, setVictory] = useStoredValue<VictoryType | null>(`victory-${gameId}`, null);
  const [playStart, setPlayStart] = useStoredValue<string| null>(`start-${gameId}`, null);
  const [victoryVisible, setVictoryVisible] = React.useState<boolean>(true);
  const [playerResults, setPlayerResults] = useStoredValue<Array<[number, VictoryType]>>('player-results', []);
  const [achievements, setAchievements] = useStoredValue<AchievementsType>('achievements', {});

  useClearStoredValues(gameId, CASH_KEYS, 2);

  React.useEffect(
    () => {
      if (gameId === undefined) return;
      setPlayStart(new Date().toISOString());
    },
    [gameId, setPlayStart],
  );

  const [unmasked, setUnmasked] = React.useState(false);
  const [[focusWord, focusWordIndex], setFocusWord] = React
    .useState<[word: string | null, index: number]>([null, 0]);

  const focusedWordCounter = React.useRef(0);

  focusedWordCounter.current = focusWordIndex;

  const handleSetFocusWord = React.useCallback((word: string): void => {
    if (word !== focusWord) {
      focusedWordCounter.current = 0;
      setFocusWord([word, 0]);
    } else {
      setFocusWord([word, (focusWordIndex + 1) % (lexicon[word] ?? 1)]);
    }
  }, [focusWord, focusWordIndex, lexicon]);

  const focusedWordScrollToCheck = React.useCallback((): boolean => {
    const isMe = focusedWordCounter.current === 0;
    focusedWordCounter.current -= 1;
    return isMe;
  }, []);

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
    if (gameId === undefined) return;

    const entry = wordAsLexicalEntry(currentGuess);
    if (freeWords?.includes(entry)) {
      return;
    }
    if (!guesses.some(([word]) => word === entry)) {
      const nextGuesses: Array<[string, boolean]> = [...guesses, [entry, false]];
      setGuesses(nextGuesses);

      let newAchievements = [];
      if (victory !== null && achievements[Achievement.ContinueGuessing] === undefined) {
        newAchievements.push(Achievement.ContinueGuessing);
      }

      newAchievements = [
        ...newAchievements,
        ...checkRankAchievements(nextGuesses, lexicon)
          .filter((achievement) => achievements[achievement] === undefined),
      ];
      newAchievements.map(reportAchievement);

      if (
        title.some(([_, __, lex]) => lex === entry)
        && title.every(([_, isHidden, lex]) => !isHidden || lex === entry)
        && pageName !== undefined
      ) {
        const playEnd = new Date();
        const playDuration = playStart === null ? null : (
          Math.floor(playEnd.getTime() / 1000)
          - Math.floor(new Date(playStart).getTime() / 1000)
        );

        const newVictory = {
          guesses: guesses.length - hints + 1,
          hints,
          accuracy: calculateAccuracy(lexicon, nextGuesses),
          revealed: calculateProgress(lexicon, freeWords, nextGuesses),
          pageName,
        };
        setVictory(newVictory);
        const newVictoryAchievements = checkVictoryAchievements(
          gameId,
          newVictory,
          nextGuesses,
          titleLexes,
          headingLexes,
          playerResults,
          playDuration,
          playEnd,
          start,
          end,
        )
          .filter((achievement) => achievements[achievement] === undefined);
        if (newVictoryAchievements.length) {
          setAchievements(
            updateAchievements(
              achievements,
              [...newAchievements, ...newVictoryAchievements],
              gameId,
            ),
          );
          newVictoryAchievements.map(reportAchievement);
        }
        setPlayerResults([...playerResults, [gameId, newVictory]]);
      } else if (newAchievements.length > 0) {
        setAchievements(updateAchievements(achievements, newAchievements, gameId));
      }
    } else {
      handleSetFocusWord(entry);
    }
  }, [
    freeWords, gameId, guesses, handleSetFocusWord, hints, lexicon, playerResults,
    setGuesses, setPlayerResults, setVictory, title, pageName, achievements, setAchievements,
    titleLexes, headingLexes, victory, playStart, start, end, reportAchievement,
  ]);

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

  const progress = useMemo(
    () => calculateProgress(lexicon, freeWords, guesses),
    [freeWords, guesses, lexicon],
  );

  React.useEffect(() => {
    if (gameId === undefined) return;
    const progressAchievements = checkRevealAchievements(progress)
      .filter((a) => achievements[a] === undefined);
    if (progressAchievements.length > 0) {
      setAchievements(updateAchievements(achievements, progressAchievements, gameId));
      progressAchievements.map(reportAchievement);
    }
  }, [achievements, gameId, progress, reportAchievement, setAchievements]);

  React.useEffect(() => {
    if (gameId === undefined) return;
    const percentAchievements = checkAchievementsPercent(achievements)
      .filter((a) => achievements[a] === undefined);
    if (percentAchievements.length > 0) {
      setAchievements(updateAchievements(achievements, percentAchievements, gameId));
      percentAchievements.map(reportAchievement);
    }
  }, [achievements, gameId, reportAchievement, setAchievements]);

  const accuracy = useMemo(
    () => calculateAccuracy(lexicon, guesses),
    [guesses, lexicon],
  );

  const articleRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <SiteMenu
        yesterdaysTitle={yesterdaysTitle}
        onShowVictory={
          victory !== null && !victoryVisible ? () => setVictoryVisible(true) : undefined
        }
        achievements={achievements}
        onSetAchievements={setAchievements}
        gameId={gameId}
      />
      <Grid
        container
        spacing={0}
        sx={{ height: '100%' }}
      >
        <Grid item sm={7} md={8} sx={{ height: '100vh', overflow: 'hidden', backgroundColor: '#EFD9CE' }}>
          <TableContainer component="div" sx={{ height: '100%' }} ref={articleRef}>
            {isError && <LoadFail />}
            <Tooltip title={`${progress.toFixed(1)}% of article revealed.`}>
              <LinearProgress
                variant={isLoading ? undefined : 'determinate'}
                value={isLoading ? undefined : progress}
                sx={{ position: 'sticky', top: 0, zIndex: 100 }}
              />
            </Tooltip>
            {victory !== null && (
              <Victory
                guesses={victory.guesses}
                hints={victory.hints}
                accuracy={victory.accuracy}
                revealed={victory.revealed}
                onRevealAll={revealAll}
                gameId={gameId}
                visible={victoryVisible}
                onSetVisible={setVictoryVisible}
                achievements={achievements}
              />
            )}
            <RedactedPage
              isSolved={victory !== null && language !== undefined && pageName !== undefined}
              title={title}
              summary={summary}
              sections={sections}
              language={language}
              pageName={pageName}
              focusWord={focusWord}
              containerNode={articleRef.current ?? undefined}
              scrollToFocusWordCheck={focusedWordScrollToCheck}
            />
          </TableContainer>
        </Grid>
        <Grid
          item
          sm={5}
          md={4}
          flexDirection="column"
          gap={1}
          sx={{
            p: 2, overflow: 'hidden', display: 'flex', height: '100vh',
          }}
        >
          <Typography variant="h6">
            {`${guesses.length} `}
            Guesses
            <Tooltip title="Percent guesses included in the article, disregarding hints">
              <span>
                {` (${accuracy.toFixed(1)}% accuracy)`}
              </span>
            </Tooltip>
          </Typography>
          <Box sx={{ height: '87vh' }}>
            <GuessTable
              focusWord={focusWord}
              guesses={guesses}
              lexicon={lexicon}
              freeWords={freeWords}
              onSetFocusWord={handleSetFocusWord}
              titleLexes={titleLexes}
              headingLexes={headingLexes}
            />
          </Box>
          <GuessInput
            isLoading={isLoading}
            isError={isError}
            isDone={progress === 100}
            unmasked={unmasked}
            hints={hints}
            freeWords={freeWords}
            onAddGuess={addGuess}
            onAddHint={addHint}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WikiPage;
