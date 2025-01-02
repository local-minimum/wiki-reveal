import {
  Box, Grid, LinearProgress, TableContainer, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useMemo } from 'react';
import { distance } from 'fastest-levenshtein';
import { GameMode } from '../api/page';

import useClearStoredValues from '../hooks/useClearStoredValues';
import useStoredValue from '../hooks/useStoredValue';
import { LexicalizedToken, Page } from '../types/wiki';
import {
  Achievement,
  AchievementsType, achievementToTitle, checkAchievementsPercent,
  checkCoopVictoryAchievements, checkRankAchievements,
  checkRevealAchievements, checkVictoryAchievements, RoomId, updateAchievements,
} from '../utils/achievements';
import { wordAsLexicalEntry } from '../utils/wiki';
import GuessHeader from './GuessHeader';
import GuessInput from './GuessInput';
import GuessTable from './GuessTable';
import { Guess } from './Guess';
import RedactedPage from './RedactedPage';
import { VictoryType } from './VictoryType';
import useRevealedPage from '../hooks/useRevealedPage';
import { UserSettings } from './menu/UserOptions';
import { BORING_HINTS } from '../utils/hints';
import { CoopRoomSettings } from '../hooks/useCoop';
import usePrevious from '../hooks/usePrevious';
import GuessCloud from './GuessCloud';
import PlayClock from './PlayClock';
import { isDefined } from '../utils/typeGates';
import { wikiPageBGColor } from '../utils/colors';
import { useGuesses } from '../hooks/useGuesses';

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
  onCoopGuess: (lex: string, isHint: boolean) => void;
  coopGuesses: Guess[];
  coopRoom: RoomId | null;
  victory: VictoryType | null;
  onSetVictory: (victory: VictoryType | null) => void;
  achievements: AchievementsType;
  onSetAchievements: (achievements: AchievementsType) => void;
  activeGuesses: Guess[];
  onSetSoloGuesses: (guesses: Guess[]) => void;
  hideWords: string[];
  unmasked: boolean;
  userSettings: UserSettings;
  coopRoomSettings: CoopRoomSettings | null;
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

function convertToGuess(
  currentGuess: string,
  lexicon: Record<string, number>,
  spellAssist: boolean,
): string | null {
  const rawEntry = wordAsLexicalEntry(currentGuess);
  if (spellAssist && rawEntry !== null && lexicon[rawEntry] === undefined) {
    const entryAlternatives = Object.keys(lexicon)
      .map<[string, number]>((lex) => [lex, distance(rawEntry, lex) / lex.length])
      .filter(([_, dist]) => dist < 0.4)
      .sort(([_, distA], [__, distB]) => (distA < distB ? -1 : 1));
    return entryAlternatives[0]?.[0] ?? rawEntry;
  }
  return rawEntry;
}

function createVictory(
  pageName: string,
  lexicon: Record<string, number>,
  guesses: Guess[],
  hints: number,
  freeWords: string[] | undefined,
  playStart: string | null,
): [victory: VictoryType, playEnd: Date] {
  const justWon = true;

  const playEnd = new Date();
  const playDuration = playStart === null ? null : (
    Math.floor(playEnd.getTime() / 1000)
          - Math.floor(new Date(playStart).getTime() / 1000)
  );

  return [
    {
      guesses: guesses.length - hints,
      hints,
      accuracy: justWon ? calculateAccuracy(lexicon, guesses) : 0,
      revealed: justWon ? calculateProgress(lexicon, freeWords, guesses) : 0,
      pageName,
      playDuration: playDuration ?? undefined,
    },
    playEnd,
  ];
}

function WikiPage({
  isLoading, isError, freeWords, lexicon, gameId, language, pageName, page,
  titleLexes, headingLexes, start, end, gameMode,
  rankings, summaryToReveal, username,
  coopUsers, coopGuesses, onCoopGuess, unmasked, coopRoom, coopRoomSettings,
  victory, onSetVictory, userSettings,
  achievements, onSetAchievements, activeGuesses, onSetSoloGuesses, hideWords,
}: WikiPageProps): JSX.Element {
  const { mobileExtraBottom, boringHints } = userSettings;
  const { enqueueSnackbar } = useSnackbar();
  const prevHideWords = usePrevious(hideWords);

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

  React.useEffect(() => {
    if (playStart == null && gameId != null) {
      setPlayStart(new Date().toISOString());
    }
  }, [gameId, playStart, setPlayStart]);

  useClearStoredValues(gameId, CASH_KEYS, gameMode, 2);

  const [[focusWord, focusWordIndex, headerRequired], setFocusWord] = React
    .useState<[word: string | null, index: number, header: boolean]>([null, 0, false]);

  const focusedWordCounter = React.useRef(0);
  const focusedWordRequireHeader = React.useRef(false);

  focusedWordCounter.current = focusWordIndex;
  focusedWordRequireHeader.current = headerRequired;

  const handleSetFocusWord = React.useCallback((
    word: string | null,
    requireHeader: boolean,
  ): void => {
    if (word != null
        && (word !== focusWord || focusedWordRequireHeader.current !== requireHeader)
    ) {
      focusedWordCounter.current = 0;
      focusedWordRequireHeader.current = requireHeader;
      const wordCount = lexicon[word] ?? 0;

      if (wordCount === 1 && word === focusWord && focusWordIndex === 0) {
        setFocusWord([word, 1, requireHeader]);
      } else {
        setFocusWord([word, 0, requireHeader]);
      }
    } else {
      const newWord = word ?? focusWord;
      setFocusWord([
        newWord,
        newWord == null ? focusWordIndex : (focusWordIndex + 1) % (lexicon[newWord] ?? 1),
        requireHeader]);
    }
  }, [focusWord, focusWordIndex, lexicon]);

  const focusedWordScrollToCheck = React.useCallback((isHeader: boolean): boolean => {
    if ((prevHideWords?.length ?? 0) > 0 && (hideWords?.length ?? 0) === 0) {
      focusedWordCounter.current = -1;
      return false;
    }
    if (focusedWordRequireHeader.current && !isHeader) {
      return false;
    }
    const isMe = focusedWordCounter.current === 0;
    focusedWordCounter.current -= 1;
    return isMe && !userSettings.noScrollPage;
  }, [hideWords?.length, prevHideWords?.length, userSettings.noScrollPage]);

  React.useEffect(() => {
    if (focusedWordCounter.current < 0) return;
    setFocusWord([focusWord, 0, headerRequired]);
  }, [focusWord, focusWordIndex, headerRequired]);

  const { title, summary, sections } = useRevealedPage(page, activeGuesses);

  const hints = React.useMemo(
    () => activeGuesses.reduce((acc, [_, isHint]) => (isHint ? acc + 1 : acc), 0),
    [activeGuesses],
  );

  React.useEffect(
    () => {
      if (gameMode !== 'coop' || pageName === undefined || page === undefined) return;

      const { title: originalTile } = page;
      if (originalTile?.length === 0) return;

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

        if (username !== null && coopRoom !== null) {
          const newCoopAchievements = checkCoopVictoryAchievements(
            username,
            coopGuesses,
            lexicon,
            titleLexes,
          ).filter((achievement) => achievements[achievement] === undefined);
          onSetAchievements(
            updateAchievements(
              achievements,
              newCoopAchievements,
              coopRoom,
            ),
          );
        }
      } else if (victory !== null && victoryGuess < 0) {
        onSetVictory(null);
      }
    },
    [
      coopGuesses, freeWords, gameMode, hints, lexicon, page, pageName,
      onSetVictory, title, victory, username, titleLexes, achievements,
      onSetAchievements, coopRoom,
    ],
  );

  const addMultiGuess = React.useCallback((currentGuesses: string[]): void => {
    if (gameId === undefined || pageName === undefined) return;

    const newGuesses: string[] = currentGuesses
      .map((g) => convertToGuess(g, lexicon, userSettings.assistSpelling))
      .filter(isDefined)
      .filter((g) => !activeGuesses.some(([word]) => word === g));

    if (newGuesses.length === 0) return;

    const justWon = title.filter(([_, isHidden, lex]) => !isHidden || newGuesses.includes(lex ?? '')).length === title.length;

    const nextGuesses: Array<Guess> = [
      ...activeGuesses,
      ...newGuesses.map((entry): Guess => [entry, false, username]),
    ];

    const [newVictory, playEnd] = justWon
      ? createVictory(pageName, lexicon, nextGuesses, hints, freeWords, playStart)
      : [null, null];

    if (gameMode === 'coop') {
      newGuesses.forEach((entry) => onCoopGuess(entry, false));

      if (newVictory != null) {
        onSetVictory(newVictory);

        if (username !== null && coopRoom !== null) {
          const newCoopAchievements = checkCoopVictoryAchievements(
            username,
            coopGuesses,
            lexicon,
            titleLexes,
          ).filter((achievement) => achievements[achievement] === undefined);
          onSetAchievements(
            updateAchievements(
              achievements,
              newCoopAchievements,
              coopRoom,
            ),
          );
        }
      }

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

    if (newVictory != null) {
      onSetVictory(newVictory);
      const newVictoryAchievements = checkVictoryAchievements(
        gameMode,
        gameId,
        newVictory,
        nextGuesses,
        titleLexes,
        headingLexes,
        playerResults,
        newVictory.playDuration ?? null,
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
  }, [
    achievements, activeGuesses, coopGuesses, coopRoom, end, freeWords, gameId,
    gameMode, headingLexes, hints, lexicon, onCoopGuess, onSetAchievements,
    onSetSoloGuesses, onSetVictory, pageName, playStart, playerResults, rankings,
    reportAchievement, setPlayerResults, start, title, titleLexes,
    userSettings.assistSpelling, username, victory,
  ]);

  const addGuess = React.useCallback((currentGuess: string): void => {
    if (gameId === undefined || pageName === undefined) return;

    const entry = convertToGuess(currentGuess, lexicon, userSettings.assistSpelling);

    if (entry === null || freeWords?.includes(entry)) {
      return;
    }

    const justWon = entry !== null && revealedTitle(title, entry);

    // Is a new guess
    if (!activeGuesses.some(([word]) => word === entry)) {
      const nextGuesses: Array<Guess> = [...activeGuesses, [entry, false, username]];

      const [newVictory, playEnd] = justWon
        ? createVictory(pageName, lexicon, nextGuesses, hints, freeWords, playStart)
        : [null, null];

      if (gameMode === 'coop') {
        onCoopGuess(entry, false);
        if (newVictory != null) {
          onSetVictory(newVictory);

          if (username !== null && coopRoom !== null) {
            const newCoopAchievements = checkCoopVictoryAchievements(
              username,
              coopGuesses,
              lexicon,
              titleLexes,
            ).filter((achievement) => achievements[achievement] === undefined);
            onSetAchievements(
              updateAchievements(
                achievements,
                newCoopAchievements,
                coopRoom,
              ),
            );
          }
        }
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

      if (newVictory != null) {
        onSetVictory(newVictory);
        const newVictoryAchievements = checkVictoryAchievements(
          gameMode,
          gameId,
          newVictory,
          nextGuesses,
          titleLexes,
          headingLexes,
          playerResults,
          newVictory.playDuration ?? null,
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
      handleSetFocusWord(entry, false);
    }
  }, [
    freeWords, gameId, activeGuesses, handleSetFocusWord, hints, lexicon, playerResults,
    onSetSoloGuesses, setPlayerResults, onSetVictory, title, pageName, achievements,
    onSetAchievements,
    titleLexes, headingLexes, victory, playStart, start, end, reportAchievement, gameMode,
    rankings, username, onCoopGuess, coopRoom, coopGuesses, userSettings.assistSpelling,
  ]);

  const addHint = React.useCallback((): void => {
    const maxCount = activeGuesses
      .filter(([word, isHint]) => !isHint && !BORING_HINTS.includes(word))
      .reduce((count, [word]) => Math.max(count, lexicon[word] ?? 0), 0);
    const options = [...Object.keys(lexicon)]
      .filter((word) => !activeGuesses.some(([w]) => w === word)
        && !freeWords?.includes(word)
        && !title.some(([_, isHidden, lex]) => isHidden && lex === word));

    if (options.length === 0) return;
    const worthy = options
      .filter(
        (word) => (boringHints || !BORING_HINTS.includes(word)) && lexicon[word] >= maxCount,
      )
      .sort((a, b) => (lexicon[a] > lexicon[b] ? 1 : -1));
    if (worthy.length > 0) {
      const word = randomEntry(worthy.slice(0, 10));
      if (gameMode === 'coop') {
        onCoopGuess(word, true);
      } else {
        onSetSoloGuesses([...activeGuesses, [word, true, null]]);
      }
      return;
    }

    const remainingGood = options
      .filter((word) => (boringHints || !BORING_HINTS.includes(word)))
      .sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));

    if (remainingGood.length > 0) {
      const word = randomEntry(remainingGood.slice(0, 10));
      if (gameMode === 'coop') {
        onCoopGuess(word, true);
      } else {
        onSetSoloGuesses([...activeGuesses, [word, true, null]]);
      }
      return;
    }

    const [boring] = options.sort((a, b) => (lexicon[a] > lexicon[b] ? -1 : 1));
    if (gameMode === 'coop') {
      onCoopGuess(boring, true);
    } else {
      onSetSoloGuesses([...activeGuesses, [boring, true, null]]);
    }
  }, [
    activeGuesses, lexicon, gameMode, freeWords, title, boringHints, onCoopGuess, onSetSoloGuesses,
  ]);

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

  const [
    sortedGuesses,
    sortType,
    sortVariant,
    changeSort,
    previousFocusWord,
    nextFocusWord,
  ] = useGuesses(activeGuesses, focusWord, lexicon, freeWords, unmasked);

  if (isSmall) {
    return (
      <>
        <PlayClock
          startISO={playStart}
          playDuration={victory?.playDuration}
          positioning={{
            position: 'fixed',
            top: 42,
            right: 6,
          }}
          hidden={userSettings.hideTimer}
        />
        <Box sx={{ backgroundColor: wikiPageBGColor(gameMode) }}>
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
            numberHints={userSettings.numberHints}
            scrollToFocusWordCheck={focusedWordScrollToCheck}
            scrollButtonYOffset="25vh"
            fontSize={userSettings.wikiFontSize}
            gameMode={gameMode}
          />
          <Box sx={{ height: mobileExtraBottom ? '40vh' : '28vh' }} />
        </Box>
        <Box
          sx={{
            height: mobileExtraBottom ? '35vh' : '25vh',
            position: 'fixed',
            bottom: 0,
            width: '100%',
            marginLeft: 0.5,
            marginRight: 0.5,
            background: 'white',
          }}
        >
          <Box sx={{ height: 'calc(25vh - 50px)' }}>
            <GuessTable
              focusWord={focusWord}
              guesses={activeGuesses}
              lexicon={lexicon}
              onSetFocusWord={handleSetFocusWord}
              titleLexes={titleLexes}
              headingLexes={headingLexes}
              rankings={rankings}
              gameMode={gameMode}
              userSettings={userSettings}
              sortedGuesses={sortedGuesses}
              sortType={sortType}
              sortVariant={sortVariant}
              onChangeSort={changeSort}
            />
          </Box>
          <GuessInput
            isLoading={isLoading}
            isError={isError}
            isDone={progress === 100}
            guesses={activeGuesses}
            unmasked={unmasked}
            hints={hints}
            freeWords={freeWords}
            onAddGuess={addGuess}
            onAddMultiGuess={addMultiGuess}
            onAddHint={addHint}
            onSetFocusWord={handleSetFocusWord}
            compact
            isCoop={gameMode === 'coop'}
            isYesterday={gameMode === 'yesterday'}
            latteralPad
            userSettings={userSettings}
            allowCoopHints={coopRoomSettings?.allowHints ?? false}
            focusWord={focusWord}
            previousFocusWord={previousFocusWord}
            nextFocusWord={nextFocusWord}
          />
        </Box>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <PlayClock
        startISO={playStart}
        playDuration={victory?.playDuration}
        hidden={userSettings.hideTimer}
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
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: wikiPageBGColor(gameMode),
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
              numberHints={userSettings.numberHints}
              fontSize={userSettings.wikiFontSize}
              gameMode={gameMode}
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
            p: 2,
            overflow: 'hidden',
            display: 'flex',
            height: '100vh',
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
              height: `calc(100vh - ${userSettings.wordCloud ? 330 : 130}px)`,
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
              userSettings={userSettings}
              sortedGuesses={sortedGuesses}
              sortType={sortType}
              sortVariant={sortVariant}
              onChangeSort={changeSort}
            />
          </Box>
          {userSettings.wordCloud && (
            <Box
              sx={{ height: '200px' }}
            >
              <GuessCloud
                guesses={activeGuesses}
                lexicon={lexicon}
                titleLexes={titleLexes}
                headingLexes={headingLexes}
              />
            </Box>
          )}
          <GuessInput
            isLoading={isLoading}
            isError={isError}
            isDone={progress === 100}
            guesses={activeGuesses}
            unmasked={unmasked}
            hints={hints}
            freeWords={freeWords}
            onAddGuess={addGuess}
            onAddMultiGuess={addMultiGuess}
            onAddHint={addHint}
            onSetFocusWord={handleSetFocusWord}
            isCoop={gameMode === 'coop'}
            isYesterday={gameMode === 'yesterday'}
            userSettings={userSettings}
            allowCoopHints={coopRoomSettings?.allowHints ?? false}
            focusWord={focusWord}
            previousFocusWord={previousFocusWord}
            nextFocusWord={nextFocusWord}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WikiPage;
