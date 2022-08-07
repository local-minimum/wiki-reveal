import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSnackbar } from 'notistack';
import { GameMode, getPage } from '../api/page';
import WikiPage from '../components/WikiPage';
import { Section } from '../types/wiki';
import uniq from '../utils/uniq';
import useStoredValue from '../hooks/useStoredValue';
import useCoop from '../hooks/useCoop';

function WikiPageContainer(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const [gameMode, setGameMode] = useStoredValue<GameMode>('game-mode', 'today');
  const [staleTime, setStaleTime] = React.useState<number>(Infinity);

  const {
    room, connected, connect, createGame, username,
  } = useCoop();

  React.useEffect(() => {
    if (localStorage.getItem('test-ws') !== null && connected === undefined) {
      connect();
    } else if (room === null) {
      createGame();
    }
  }, [room, createGame, connected, connect]);

  const { isLoading, isError, data } = useQuery(
    ['page', gameMode],
    () => getPage(gameMode),
    {
      staleTime,
      onSuccess: ({ end: endTime }) => {
        const remaining = endTime.getTime() - new Date().getTime();
        // Keep stale until just after next game publication
        // Allows for a certain achievement
        setStaleTime(remaining + 1000 + Math.random() * 2000);
      },
    },
  );

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
    start, end,
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
    const getSectionLexes = (sections: Section[]): string[] => sections
      .map((section) => [
        ...section.title
          .filter(([, isHidden]) => isHidden)
          .map(([_, __, lex]) => lex),
        ...getSectionLexes(section.sections),
      ]).flat();

    const titleWords = page?.title
      .filter(([, isHidden]) => isHidden)
      .map(([_, __, lex]) => lex) ?? [];

    return [
      uniq(titleWords),
      uniq(getSectionLexes(page?.sections ?? [])),
    ];
  }, [page]);

  const summaryToReveal = React.useMemo(
    () => page?.summary.reduce<Record<string, number>>((acc, paragraph) => {
      paragraph.forEach(([, isHidden, lex]) => {
        if (!isHidden && !freeWords?.includes(lex)) {
          acc[lex] = (acc[lex] ?? 0) + 1;
        }
      });
      return acc;
    }, {}),
    [freeWords, page?.summary],
  );

  return (
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
      yesterdaysTitle={yesterdaysTitle}
      start={start}
      end={end}
      gameMode={gameMode}
      onChangeGameMode={setGameMode}
      username={username}
    />
  );
}

export default WikiPageContainer;
