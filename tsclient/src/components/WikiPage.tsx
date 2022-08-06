import {
  Box, Grid, LinearProgress, TableContainer, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useMemo } from 'react';
import { GameMode } from '../api/page';

import useClearStoredValues from '../hooks/useClearStoredValues';
import useStoredValue from '../hooks/useStoredValue';
import { LexicalizedToken, Page } from '../types/wiki';
import {
  Achievement,
  AchievementsType, achievementToTitle, checkAchievementsPercent, checkRankAchievements,
  checkRevealAchievements, checkVictoryAchievements, updateAchievements,
} from '../utils/achievements';
import { unmaskPage, wordAsLexicalEntry } from '../utils/wiki';
import GuessHeader from './GuessHeader';
import GuessInput from './GuessInput';
import GuessTable from './GuessTable';
import LoadFail from './LoadFail';
import HowTo from './menu/HowTo';
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
  rankings: Record<string, number>,
  gameId: number | undefined;
  language: string | undefined;
  pageName: string | undefined;
  page: Page | undefined;
  titleLexes: string[];
  headingLexes: string[];
  summaryToReveal: Record<string, number> | undefined;
  yesterdaysTitle: LexicalizedToken[] | undefined;
  start: Date | undefined;
  end: Date | undefined;
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
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
  titleLexes, headingLexes, yesterdaysTitle, start, end, gameMode, onChangeGameMode,
  rankings, summaryToReveal,
}: WikiPageProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const reportAchievement = React.useCallback((achievement: Achievement): void => {
    enqueueSnackbar(
      (
        <>
          <strong>Achievement:</strong>
          {' '}
          {achievementToTitle(achievement)[0]}
        </>
      ),
      { variant: 'success' },
    );
  }, [enqueueSnackbar]);

  const [guesses, setGuesses] = useStoredValue<Array<[word: string, hinted: boolean]>>(`guesses-${gameId}`, []);
  const [victory, setVictory] = useStoredValue<VictoryType | null>(`victory-${gameId}`, null);
  const [playStart, setPlayStart] = useStoredValue<string| null>(`start-${gameId}`, null);
  const [firstVisit, setFirstVisit] = useStoredValue<boolean>('first-visit', true);
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

  const [hideFound, setHideFound] = React.useState<boolean>(false);
  const hideWords = useMemo(
    () => (hideFound ? guesses.map(([word]) => word) : []),
    [guesses, hideFound],
  );
  const [unmasked, setUnmasked] = React.useState<boolean>(false);
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
        ...checkRankAchievements(nextGuesses, rankings)
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
          gameMode,
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
    titleLexes, headingLexes, victory, playStart, start, end, reportAchievement, gameMode,
    rankings,
  ]);

  const addHint = React.useCallback((): void => {
    const maxCount = guesses
      .reduce((count, [word]) => Math.max(count, lexicon[word] ?? 0), 0);
    const options = [...Object.keys(lexicon)]
      .filter((word) => !guesses.some(([w]) => w === word)
        && !freeWords?.includes(word)
        && !title.some(([_, isHidden, lex]) => isHidden && lex === word));

    if (options.length === 0) return;

    const worthy = options.filter((word) => lexicon[word] >= maxCount * 0.95);
    if (worthy.length > 0) {
      setGuesses([...guesses, [randomEntry(worthy), true]]);
      return;
    }

    const remaining = options.sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));
    setGuesses(
      [
        ...guesses,
        [randomEntry(remaining.slice(0, Math.max(10, Math.ceil(remaining.length * 0.05)))), true],
      ],
    );
  }, [freeWords, guesses, lexicon, setGuesses, title]);

  const progress = useMemo(
    () => calculateProgress(lexicon, freeWords, guesses),
    [freeWords, guesses, lexicon],
  );

  React.useEffect(() => {
    if (gameId === undefined) return;
    const solvedHeaders = headingLexes
      .filter((lex) => !guesses.some(([word, isHint]) => !isHint && lex === word))
      .length === 0;
    const [summaryFound, summaryTotal] = Object
      .entries(summaryToReveal ?? {})
      .reduce<[number, number]>(([found, total], [lex, count]) => {
        if (guesses.some(([word, isHint]) => word === lex && !isHint)) {
          return [found + count, total + count];
        }
        return [found, total + count];
      }, [0, 0]);
    const progressAchievements = checkRevealAchievements(
      progress,
      solvedHeaders,
      summaryFound / summaryTotal,
    )
      .filter((a) => achievements[a] === undefined);
    if (progressAchievements.length > 0) {
      setAchievements(updateAchievements(achievements, progressAchievements, gameId));
      progressAchievements.map(reportAchievement);
    }
  }, [
    achievements, gameId, guesses, headingLexes, progress,
    reportAchievement, setAchievements, summaryToReveal,
  ]);

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

  const closeHowTo = React.useCallback(() => setFirstVisit(false), [setFirstVisit]);

  const articleRef = React.useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {isError && <LoadFail />}
      {firstVisit && <HowTo onClose={closeHowTo} />}
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
      <SiteMenu
        yesterdaysTitle={yesterdaysTitle}
        onShowVictory={
          victory !== null && !victoryVisible ? () => setVictoryVisible(true) : undefined
        }
        achievements={achievements}
        onSetAchievements={setAchievements}
        gameId={gameId}
        hideFound={hideFound}
        onHideFound={setHideFound}
        end={end}
        gameMode={gameMode}
        onChangeGameMode={onChangeGameMode}
      />
      <Grid
        container
        spacing={0}
        sx={{ height: '100%' }}
      >
        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          sx={{
            height: isSmall ? '75vh' : '100vh',
            overflow: 'hidden',
            backgroundColor: '#EFD9CE',
          }}
        >
          <TableContainer component="div" sx={{ height: '100%' }} ref={articleRef}>
            <Tooltip title={`${progress.toFixed(1)}% of article revealed.`}>
              <LinearProgress
                variant={isLoading ? undefined : 'determinate'}
                value={isLoading ? undefined : progress}
                sx={{ position: 'sticky', top: 0, zIndex: 100 }}
              />
            </Tooltip>
            <RedactedPage
              hideWords={hideWords}
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
          xs={12}
          sm={5}
          md={4}
          flexDirection="column"
          gap={1}
          sx={{
            p: isSmall ? 0.5 : 2,
            overflow: 'hidden',
            display: 'flex',
            height: isSmall ? '25vh' : '100vh',
          }}
        >
          <GuessHeader guesses={guesses.length} accuracy={accuracy} />
          <Box
            sx={{
              // Header height 0px / 32px
              // Guess box height 40px / 56px
              // Gap 8px
              // Padding 4px
              // And some extra?
              height: `calc(${isSmall ? 25 : 100}vh - ${isSmall ? 60 : 130}px)`,
            }}
          >
            <GuessTable
              focusWord={focusWord}
              guesses={guesses}
              lexicon={lexicon}
              freeWords={freeWords}
              onSetFocusWord={handleSetFocusWord}
              titleLexes={titleLexes}
              headingLexes={headingLexes}
              rankings={rankings}
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
            compact={isSmall}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WikiPage;
