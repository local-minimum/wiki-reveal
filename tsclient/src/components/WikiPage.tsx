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
import LoadFail from './LoadFail';
import HowTo from './menu/HowTo';
import RedactedPage from './RedactedPage';
import SiteMenu from './SiteMenu';
import Victory from './Victory';
import { VictoryType } from './VictoryType';
import { CoopGameType, ExpireType } from '../hooks/useCoop';
import usePrevious from '../hooks/usePrevious';
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
  yesterdaysTitle: LexicalizedToken[] | undefined;
  start: Date | undefined;
  end: Date | undefined;
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
  username: string | null;
  onChangeUsername: (newName: string | null) => void;
  onCreateCoopGame: (gameType: CoopGameType, expireType: ExpireType, expire: number) => void;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  coopRoom: string | null;
  coopInRoom: boolean;
  coopUsers: string[];
  onCoopGuess: (lex: string) => void;
  coopGuesses: Guess[];
  onJoinCoopGame: (room: string) => void;
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
  titleLexes, headingLexes, yesterdaysTitle, start, end, gameMode, onChangeGameMode,
  rankings, summaryToReveal, username, onChangeUsername, onCreateCoopGame, connected,
  onConnect, onDisconnect, coopRoom, coopUsers, coopGuesses, onCoopGuess, onJoinCoopGame,
  coopInRoom,
}: WikiPageProps): JSX.Element {
  const prevGameMode = usePrevious(gameMode);
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

  const [guesses, setGuesses] = useStoredValue<Array<Guess>>(`guesses-${gameMode}-${gameId}`, []);
  const [victory, setVictory] = useStoredValue<VictoryType | null>(`victory-${gameMode}-${gameId}`, null);
  const [playStart, setPlayStart] = useStoredValue<string| null>(`start-${gameMode}-${gameId}`, null);
  const [firstVisit, setFirstVisit] = useStoredValue<boolean>('first-visit', true);
  const [victoryVisible, setVictoryVisible] = React.useState<boolean>(true);
  const [playerResults, setPlayerResults] = useStoredValue<Array<[number, VictoryType]>>('player-results', []);
  const [achievements, setAchievements] = useStoredValue<AchievementsType>('achievements', {});

  useClearStoredValues(gameId, CASH_KEYS, gameMode, 2);

  React.useEffect(
    () => {
      if (gameId === undefined) return;
      setPlayStart(new Date().toISOString());
    },
    [gameId, setPlayStart],
  );

  const activeGuesses = gameMode === 'coop' ? coopGuesses : guesses;

  const [hideFound, setHideFound] = React.useState<boolean>(false);
  const hideWords = useMemo(
    () => (hideFound ? activeGuesses.map(([word]) => word) : []),
    [activeGuesses, hideFound],
  );
  const [unmasked, setUnmasked] = React.useState<number>(-1);
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
    setUnmasked(gameId ?? -1);
  }, [gameId]);

  const { title, summary, sections } = useRevealedPage(page, activeGuesses, unmasked === gameId);

  React.useEffect(() => {
    if (prevGameMode !== gameMode && (gameMode === 'coop' || prevGameMode === 'coop')) {
      setVictoryVisible(true);
      setUnmasked(-1);
    }
  }, [gameMode, prevGameMode, setGuesses, setVictory]);

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

        setVictory(newVictory);
      } else if (victory !== null && victoryGuess < 0) {
        setVictory(null);
      }
    },
    [coopGuesses, freeWords, gameMode, hints, lexicon, page, pageName, setVictory, title, victory],
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
        if (justWon) setVictory(newVictory);
        return;
      }
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

      if (justWon) {
        const playEnd = new Date();
        const playDuration = playStart === null ? null : (
          Math.floor(playEnd.getTime() / 1000)
          - Math.floor(new Date(playStart).getTime() / 1000)
        );

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
        // TODO what happens if player complete yesterdays after todays?
        setPlayerResults([...playerResults, [gameId, newVictory]]);
      } else if (newAchievements.length > 0) {
        setAchievements(updateAchievements(achievements, newAchievements, gameId));
      }
    } else {
      handleSetFocusWord(entry);
    }
  }, [
    freeWords, gameId, activeGuesses, handleSetFocusWord, hints, lexicon, playerResults,
    setGuesses, setPlayerResults, setVictory, title, pageName, achievements, setAchievements,
    titleLexes, headingLexes, victory, playStart, start, end, reportAchievement, gameMode,
    rankings, username, onCoopGuess,
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
      setGuesses([...guesses, [randomEntry(worthy), true, null]]);
      return;
    }

    const remaining = options.sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));
    setGuesses(
      [
        ...guesses,
        [
          randomEntry(remaining.slice(0, Math.max(10, Math.ceil(remaining.length * 0.05)))),
          true,
          null,
        ],
      ],
    );
  }, [freeWords, guesses, lexicon, setGuesses, title]);

  const progress = useMemo(
    () => calculateProgress(lexicon, freeWords, activeGuesses),
    [freeWords, activeGuesses, lexicon],
  );

  React.useEffect(() => {
    if (gameId === undefined || gameMode === 'coop') return;
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
    reportAchievement, setAchievements, summaryToReveal, gameMode,
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
    () => calculateAccuracy(lexicon, activeGuesses),
    [activeGuesses, lexicon],
  );

  const closeHowTo = React.useCallback(() => setFirstVisit(false), [setFirstVisit]);

  const articleRef = React.useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChangeUsername = React.useCallback((newName: string | null) => {
    if (gameMode !== 'coop') {
      setGuesses(guesses.map(([lex, isHint]) => [
        lex,
        isHint,
        !isHint ? newName : null,
      ]));
    }
    onChangeUsername(newName);
  }, [gameMode, guesses, setGuesses, onChangeUsername]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {isError && <LoadFail gameMode={gameMode} />}
      {firstVisit && <HowTo onClose={closeHowTo} />}
      {victory !== null && (
        <Victory
          gameMode={gameMode}
          guesses={victory.guesses}
          hints={victory.hints}
          accuracy={victory.accuracy}
          revealed={victory.revealed}
          onRevealAll={revealAll}
          gameId={gameId}
          visible={victoryVisible && !isLoading && activeGuesses.length > 0}
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
        username={username}
        onChangeUsername={handleChangeUsername}
        connected={connected}
        onCreateCoopGame={onCreateCoopGame}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        coopRoom={coopRoom}
        coopInRoom={coopInRoom}
        coopUsers={coopUsers}
        onJoinCoopGame={onJoinCoopGame}
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
            unmasked={unmasked === gameId}
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
