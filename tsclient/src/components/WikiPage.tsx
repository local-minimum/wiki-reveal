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
import { wordAsLexicalEntry } from '../utils/wiki';
import GuessHeader from './GuessHeader';
import GuessInput from './GuessInput';
import GuessTable from './GuessTable';
import { Guess } from './Guess';
import RedactedPage from './RedactedPage';
import { VictoryType } from './VictoryType';
import useRevealedPage from '../hooks/useRevealedPage';

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
  start: Date | undefined;
  end: Date | undefined;
  gameMode: GameMode;
  username: string | null;
  coopUsers: string[];
  onCoopGuess: (lex: string) => void;
  coopGuesses: Guess[];
  victory: VictoryType | null;
  onSetVictory: (victory: VictoryType | null) => void;
  achievements: AchievementsType;
  onSetAchievements: (achievements: AchievementsType) => void;
  activeGuesses: Guess[];
  onSetSoloGuesses: (guesses: Guess[]) => void;
  hideWords: string[];
  unmasked: boolean;
}

function calculateProgress(
  lexicon: Record<string, number>,
  freeWords: string[] | undefined,
  guesses: Array<Guess>,
): number {
  const total = Object.values(lexicon).reduce((acc, count) => acc + count, 0);
  const found = [...(freeWords ?? []), ...guesses.map(([w]) => w)]
    .reduce((acc, guess) => acc + (lexicon[guess] ?? 0), 0);
  return Math.min(100, 100 * found / total);
}

function calculateAccuracy(
  lexicon: Record<string, number>,
  guesses: Array<Guess>,
): number {
  const trueGuesses = guesses.filter(([, hinted]) => !hinted);
  if (trueGuesses.length === 0) return 0;

  return 100
    * trueGuesses.filter(([word]) => (lexicon[word] ?? 0) > 0).length
    / trueGuesses.length;
}

function revealedTitle(
  title: LexicalizedToken[],
  entry: string,
): boolean {
  return (
    title.some(([_, __, lex]) => lex === entry)
      && title.every(([_, isHidden, lex]) => !isHidden || lex === entry)
  );
}

function WikiPage({
  isLoading, isError, freeWords, lexicon, gameId, language, pageName, page,
  titleLexes, headingLexes, start, end, gameMode,
  rankings, summaryToReveal, username,
  coopUsers, coopGuesses, onCoopGuess, unmasked,
  victory, onSetVictory,
  achievements, onSetAchievements, activeGuesses, onSetSoloGuesses, hideWords,
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

  const [playStart, setPlayStart] = useStoredValue<string| null>(`start-${gameMode}-${gameId}`, null);
  const [playerResults, setPlayerResults] = useStoredValue<Array<[number, VictoryType]>>('player-results', []);

  useClearStoredValues(gameId, CASH_KEYS, gameMode, 2);

  React.useEffect(
    () => {
      if (gameId === undefined) return;
      setPlayStart(new Date().toISOString());
    },
    [gameId, setPlayStart],
  );

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

  const { title, summary, sections } = useRevealedPage(page, activeGuesses);

  const hints = React.useMemo(
    () => activeGuesses.reduce((acc, [_, isHint]) => (isHint ? acc + 1 : acc), 0),
    [activeGuesses],
  );

  React.useEffect(
    () => {
      if (gameMode !== 'coop' || pageName === undefined || page === undefined) return;

      const { title: originalTile } = page;
      if (originalTile === []) return;

      const tLexes = originalTile
        .filter(([_, isHidden]) => isHidden)
        .map(([_, __, lex]) => lex);
      const found = tLexes.map(() => false);
      let victoryGuess = -1;
      coopGuesses.forEach(([guessLex], guessIdx) => {
        if (victoryGuess >= 0) return;
        tLexes.forEach((titleLex, titleIdx) => {
          if (titleLex === guessLex) {
            found[titleIdx] = true;
          }
        });
        if (found.every((v) => v)) {
          victoryGuess = guessIdx;
        }
      });

      if (victory === null && victoryGuess >= 0) {
        const newVictory = {
          guesses: victoryGuess + 1,
          hints,
          accuracy: calculateAccuracy(lexicon, coopGuesses),
          revealed: calculateProgress(lexicon, freeWords, coopGuesses),
          pageName,
        };

        onSetVictory(newVictory);
      } else if (victory !== null && victoryGuess < 0) {
        onSetVictory(null);
      }
    },
    [
      coopGuesses, freeWords, gameMode, hints, lexicon, page, pageName,
      onSetVictory, title, victory,
    ],
  );

  const addGuess = React.useCallback((currentGuess: string): void => {
    if (gameId === undefined || pageName === undefined) return;
    const entry = wordAsLexicalEntry(currentGuess);
    const justWon = revealedTitle(title, entry);

    if (freeWords?.includes(entry)) {
      return;
    }
    if (!activeGuesses.some(([word]) => word === entry)) {
      const nextGuesses: Array<Guess> = [...activeGuesses, [entry, false, username]];

      const newVictory = {
        guesses: activeGuesses.length - hints + 1,
        hints,
        accuracy: justWon ? calculateAccuracy(lexicon, nextGuesses) : 0,
        revealed: justWon ? calculateProgress(lexicon, freeWords, nextGuesses) : 0,
        pageName,
      };

      if (gameMode === 'coop') {
        onCoopGuess(entry);
        if (justWon) onSetVictory(newVictory);
        return;
      }
      onSetSoloGuesses(nextGuesses);

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

      if (justWon) {
        const playEnd = new Date();
        const playDuration = playStart === null ? null : (
          Math.floor(playEnd.getTime() / 1000)
          - Math.floor(new Date(playStart).getTime() / 1000)
        );

        onSetVictory(newVictory);
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
          onSetAchievements(
            updateAchievements(
              achievements,
              [...newAchievements, ...newVictoryAchievements],
              gameId,
            ),
          );
          newVictoryAchievements.map(reportAchievement);
        }
        // TODO what happens if player complete yesterdays after todays?
        setPlayerResults([...playerResults, [gameId, newVictory]]);
      } else if (newAchievements.length > 0) {
        onSetAchievements(updateAchievements(achievements, newAchievements, gameId));
      }
    } else {
      handleSetFocusWord(entry);
    }
  }, [
    freeWords, gameId, activeGuesses, handleSetFocusWord, hints, lexicon, playerResults,
    onSetSoloGuesses, setPlayerResults, onSetVictory, title, pageName, achievements,
    onSetAchievements,
    titleLexes, headingLexes, victory, playStart, start, end, reportAchievement, gameMode,
    rankings, username, onCoopGuess,
  ]);

  const addHint = React.useCallback((): void => {
    const maxCount = activeGuesses
      .reduce((count, [word]) => Math.max(count, lexicon[word] ?? 0), 0);
    const options = [...Object.keys(lexicon)]
      .filter((word) => !activeGuesses.some(([w]) => w === word)
        && !freeWords?.includes(word)
        && !title.some(([_, isHidden, lex]) => isHidden && lex === word));

    if (options.length === 0) return;

    const worthy = options.filter((word) => lexicon[word] >= maxCount * 0.95);
    if (worthy.length > 0) {
      onSetSoloGuesses([...activeGuesses, [randomEntry(worthy), true, null]]);
      return;
    }

    const remaining = options.sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));
    onSetSoloGuesses(
      [
        ...activeGuesses,
        [
          randomEntry(remaining.slice(0, Math.max(10, Math.ceil(remaining.length * 0.05)))),
          true,
          null,
        ],
      ],
    );
  }, [freeWords, activeGuesses, lexicon, onSetSoloGuesses, title]);

  const progress = useMemo(
    () => calculateProgress(lexicon, freeWords, activeGuesses),
    [freeWords, activeGuesses, lexicon],
  );

  React.useEffect(() => {
    if (gameId === undefined || gameMode === 'coop') return;
    const solvedHeaders = headingLexes
      .filter((lex) => !activeGuesses.some(([word, isHint]) => !isHint && lex === word))
      .length === 0;
    const [summaryFound, summaryTotal] = Object
      .entries(summaryToReveal ?? {})
      .reduce<[number, number]>(([found, total], [lex, count]) => {
        if (activeGuesses.some(([word, isHint]) => word === lex && !isHint)) {
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
      onSetAchievements(updateAchievements(achievements, progressAchievements, gameId));
      progressAchievements.map(reportAchievement);
    }
  }, [
    achievements, gameId, activeGuesses, headingLexes, progress,
    reportAchievement, onSetAchievements, summaryToReveal, gameMode,
  ]);

  React.useEffect(() => {
    if (gameId === undefined) return;
    const percentAchievements = checkAchievementsPercent(achievements)
      .filter((a) => achievements[a] === undefined);
    if (percentAchievements.length > 0) {
      onSetAchievements(updateAchievements(achievements, percentAchievements, gameId));
      percentAchievements.map(reportAchievement);
    }
  }, [achievements, gameId, reportAchievement, onSetAchievements]);

  const accuracy = useMemo(
    () => calculateAccuracy(lexicon, activeGuesses),
    [activeGuesses, lexicon],
  );

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
              masked={!unmasked}
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
          <GuessHeader
            guesses={activeGuesses.length}
            accuracy={accuracy}
            isCoop={gameMode === 'coop'}
            coopUsers={coopUsers}
          />
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
              guesses={activeGuesses}
              lexicon={lexicon}
              onSetFocusWord={handleSetFocusWord}
              titleLexes={titleLexes}
              headingLexes={headingLexes}
              rankings={rankings}
              gameMode={gameMode}
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
            isCoop={gameMode === 'coop'}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WikiPage;
