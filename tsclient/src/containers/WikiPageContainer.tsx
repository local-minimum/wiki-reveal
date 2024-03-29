import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSnackbar } from 'notistack';
import { GameMode, getPage } from '../api/page';
import WikiPage from '../components/WikiPage';
import { Section } from '../types/wiki';
import uniq from '../utils/uniq';
import useStoredValue from '../hooks/useStoredValue';
import useCoop, { CoopGameType, CoopRoomSettings, ExpireType } from '../hooks/useCoop';
import { VictoryType } from '../components/VictoryType';
import { AchievementsType } from '../utils/achievements';
import { Guess } from '../components/Guess';
import SiteMenu from '../components/SiteMenu';
import LoadFail from '../components/LoadFail';
import HowTo from '../components/menu/HowTo';
import Victory from '../components/Victory';
import usePrevious from '../hooks/usePrevious';
import { defaultSettings, UserSettings } from '../components/menu/UserOptions';
import useNews from '../hooks/useNews';
import News from '../components/News';
import { getAbout } from '../api/about';
import GameStats from '../components/GameStats';

function WikiPageContainer(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const [gameMode, setGameMode] = useStoredValue<GameMode>('game-mode', 'today');
  const prevGameMode = usePrevious(gameMode);
  const [staleTime, setStaleTime] = React.useState<number>(-Infinity);

  const {
    room, connected, connect, createGame, username, renameMe, disconnect, users, guess,
    guesses: coopGuesses,
    join, inRoom,
    roomSettings,
  } = useCoop(gameMode);

  const handleCreateCoopGame = React.useCallback((
    gameType: CoopGameType,
    expireType: ExpireType,
    expire: number,
    guesses: Array<[string, boolean]>,
    settings: CoopRoomSettings,
  ) => {
    if (connected !== true) {
      enqueueSnackbar(
        'Could not create room because you are not live-connected',
        { variant: 'error' },
      );
    } else {
      createGame(gameType, expireType, expire, guesses, settings);
      setGameMode('coop');
    }
  }, [connected, createGame, enqueueSnackbar, setGameMode]);

  const handleJoinCoopGame = React.useCallback((
    roomId: string,
  ) => {
    if (connected !== true) {
      enqueueSnackbar(
        'Could not create room because you are not live-connected',
        { variant: 'error' },
      );
    } else {
      join(roomId);
      setGameMode('coop');
    }
  }, [connected, enqueueSnackbar, join, setGameMode]);

  const handleChangeGameMode = React.useCallback((newGameMode: GameMode) => {
    if (gameMode === 'coop' && newGameMode !== 'coop') {
      disconnect();
    }
    setGameMode(newGameMode);
  }, [disconnect, gameMode, setGameMode]);

  const { isLoading, isError, data } = useQuery(
    ['page', gameMode === 'coop' ? `coop-${room ?? ''}` : gameMode],
    () => getPage(gameMode, room),
    {
      staleTime,
      onSuccess: ({ end: endTime }) => {
        const remaining = endTime.getTime() - new Date().getTime();
        // Keep stale until just after next game publication
        // Allows for a certain achievement
        setStaleTime(remaining + 1000 + Math.random() * 2000);
      },
      retry: gameMode !== 'coop' && room !== null,
    },
  );

  const { data: aboutData } = useQuery(['about'], getAbout, {
    staleTime: Infinity,
  });

  const [showGameStats, setShowGameStats] = React.useState(false);

  React.useEffect(() => {
    if (Number.isFinite(staleTime)) {
      const timeout = setTimeout(() => setStaleTime(-Infinity), staleTime);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [staleTime]);

  React.useEffect(() => {
    if (gameMode === 'yesterday') {
      enqueueSnackbar('Playing yesterday\'s game', { variant: 'info' });
    } else if (gameMode === 'today') {
      enqueueSnackbar('Playing today\'s game', { variant: 'info' });
    } else {
      enqueueSnackbar('Playing a cooperative game', { variant: 'info' });
    }
  }, [enqueueSnackbar, gameMode]);

  const {
    page, freeWords, lexicon, gameId, language, pageName, yesterdaysTitle,
    yesterdaysPage, start, end,
  } = data ?? { lexicon: {} as Record<string, number> };

  const rankings = React.useMemo(() => {
    const sorted: Array<[string, number]> = [...Object.entries(lexicon)]
      .filter(([word]) => !(freeWords?.includes(word) ?? false))
      .sort(([, a], [, b]) => (a < b ? 1 : -1));

    let splitting = 0;
    return Object.fromEntries(
      sorted.map(([word, count], idx, arr) => {
        if (idx === 0 || arr[idx - 1][1] !== count) {
          splitting = 0;
          return [word, idx + 1];
        }
        splitting += 1;
        return [word, idx + 1 - splitting];
      }),
    );
  }, [freeWords, lexicon]);

  const [titleLexes, headingLexes] = React.useMemo(() => {
    const isLex = (lex: string | null): lex is string => lex !== null;

    const getSectionLexes = (sections: Section[]): string[] => sections
      .map((section) => [
        ...section.title
          .filter(([_, isHidden, lex]) => isHidden)
          .map(([_, __, lex]) => lex)
          .filter(isLex),
        ...getSectionLexes(section.sections),
      ]).flat();

    const titleWords = page?.title
      .filter(([, isHidden]) => isHidden)
      .map(([_, __, lex]) => lex) ?? [];

    return [
      uniq(titleWords.filter(isLex)),
      uniq(getSectionLexes(page?.sections ?? [])),
    ];
  }, [page]);

  const summaryToReveal = React.useMemo(
    () => page?.summary.reduce<Record<string, number>>((acc, paragraph) => {
      paragraph.forEach(([, isHidden, lex]) => {
        if (!isHidden && lex !== null && !freeWords?.includes(lex)) {
          acc[lex] = (acc[lex] ?? 0) + 1;
        }
      });
      return acc;
    }, {}),
    [freeWords, page?.summary],
  );

  const coopOrSolo = gameMode === 'coop' ? 'coop' : 'solo';
  const [userSettings, setUserSettings] = useStoredValue<UserSettings>('user-settings', defaultSettings, true);
  const [victory, setVictory] = useStoredValue<VictoryType | null>(
    `victory-${coopOrSolo}-${gameId}`,
    null,
  );
  const [soloGuesses, setSoloGuesses] = useStoredValue<Guess[]>(
    `guesses-${coopOrSolo}-${gameId}`,
    [],
  );
  const [victoryVisible, setVictoryVisible] = React.useState<boolean>(true);
  const [achievements, setAchievements] = useStoredValue<AchievementsType>('achievements', {});

  const activeGuesses = gameMode === 'coop' ? coopGuesses : soloGuesses;
  const [hideFound, setHideFound] = React.useState<boolean>(false);
  const hideWords = React.useMemo(
    () => (hideFound ? activeGuesses.map(([word]) => word) : []),
    [activeGuesses, hideFound],
  );

  const handleChangeUsername = React.useCallback((newName: string | null) => {
    if (gameMode !== 'coop') {
      setSoloGuesses(activeGuesses.map(([lex, isHint]) => [
        lex,
        isHint,
        !isHint ? newName : null,
      ]));
    }
    renameMe(newName);
  }, [gameMode, renameMe, setSoloGuesses, activeGuesses]);

  const [firstVisit, setFirstVisit] = useStoredValue<boolean>('first-visit', true);
  const closeHowTo = React.useCallback(() => setFirstVisit(false), [setFirstVisit]);
  const { news, onRead: onReadNews } = useNews();

  const [unmasked, setUnmasked] = React.useState<number>(-1);
  const revealAll = React.useCallback((): void => {
    setUnmasked(gameId ?? -1);
  }, [gameId]);

  React.useEffect(() => {
    if (prevGameMode !== gameMode && (gameMode === 'coop' || prevGameMode === 'coop')) {
      setVictoryVisible(true);
      setUnmasked(-1);
    }
  }, [gameMode, prevGameMode, setVictoryVisible]);

  React.useEffect(() => {
    const searchRoom = new URLSearchParams(window.location.search).get('coop');
    if (searchRoom != null) {
      if (!connected) {
        handleChangeGameMode('coop');
      } else if (connected) {
        handleJoinCoopGame(searchRoom);
        window.history.replaceState(null, '', window.location.href.split('?')[0]);
      }
    }
  }, [connect, connected, handleChangeGameMode, handleJoinCoopGame]);

  const onCloseFail = React.useCallback((): void => {
    if (gameMode === 'coop') {
      handleChangeGameMode('today');
    }
  }, [gameMode, handleChangeGameMode]);

  return (
    <>
      {firstVisit && <HowTo onClose={closeHowTo} />}
      {!firstVisit && isError && <LoadFail gameMode={gameMode} onClose={onCloseFail} />}
      {!firstVisit && !isError && news.length > 0 && <News onClose={onReadNews} news={news} /> }
      {showGameStats && (
        <GameStats
          onClose={() => setShowGameStats(false)}
          guesses={activeGuesses}
          lexicon={lexicon}
          titleLexes={titleLexes}
          headingLexes={headingLexes}
          rankings={rankings}
          userSettings={userSettings}
          gameMode={gameMode}
        />
      )}
      {!firstVisit && !isError && news.length === 0 && victory !== null && (
        <Victory
          gameName={aboutData?.name}
          gameMode={gameMode}
          guesses={victory.guesses}
          hints={victory.hints}
          accuracy={victory.accuracy}
          revealed={victory.revealed}
          gameDuration={victory.playDuration}
          onRevealAll={revealAll}
          onUnrevealAll={() => setUnmasked(-1)}
          unmasked={unmasked === gameId}
          game={gameMode === 'coop' ? (room ?? undefined) : gameId}
          visible={victoryVisible && !isLoading && activeGuesses.length > 0}
          onSetVisible={setVictoryVisible}
          achievements={achievements}
          onShowStats={() => setShowGameStats(true)}
        />
      )}
      <SiteMenu
        about={aboutData}
        yesterdaysTitle={yesterdaysTitle}
        yesterdaysPage={yesterdaysPage}
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
        onChangeGameMode={handleChangeGameMode}
        username={username}
        onChangeUsername={handleChangeUsername}
        connected={connected}
        onCreateCoopGame={handleCreateCoopGame}
        onConnect={connect}
        onDisconnect={disconnect}
        coopRoom={room}
        coopInRoom={inRoom}
        coopUsers={users}
        onJoinCoopGame={handleJoinCoopGame}
        userSettings={userSettings}
        onChangeUserSettings={setUserSettings}
        language={language}
        onShowGameStats={() => setShowGameStats(true)}
      />
      <WikiPage
        isLoading={isLoading}
        isError={isError}
        freeWords={freeWords}
        lexicon={lexicon}
        rankings={rankings}
        gameId={gameId}
        language={language}
        pageName={pageName}
        page={page}
        titleLexes={titleLexes}
        headingLexes={headingLexes}
        summaryToReveal={summaryToReveal}
        start={start}
        end={end}
        gameMode={gameMode}
        username={username}
        coopUsers={users}
        coopRoom={room}
        onCoopGuess={guess}
        coopGuesses={coopGuesses}
        victory={victory}
        onSetVictory={setVictory}
        achievements={achievements}
        onSetAchievements={setAchievements}
        onSetSoloGuesses={setSoloGuesses}
        hideWords={hideWords}
        activeGuesses={activeGuesses}
        unmasked={unmasked === gameId}
        userSettings={userSettings}
        coopRoomSettings={roomSettings}
      />
    </>
  );
}

export default WikiPageContainer;
