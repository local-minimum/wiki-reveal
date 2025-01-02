import * as React from 'react';
import { Guess } from '../components/Guess';
import useStoredValue from './useStoredValue';

export type SortType = 'order' | 'alphabetical' | 'count' | 'rank';
export type SortVariant = 'asc' | 'desc';
export type SortedGuess = [word: string, ordinal: number, isHint: boolean, userName: string | null];

function orderSort(a: number, b: number, mode: 'asc' | 'desc'): 1 | -1 {
  if (Number.isNaN(a)) return 1;
  if (Number.isNaN(b)) return -1;
  if (mode === 'desc') {
    return a > b ? 1 : -1;
  }
  return a > b ? -1 : 1;
}

export const useGuesses = (
  guesses: Array<Guess>,
  focusWord: string | null,
  lexicon: Record<string, number>,
  freeWords: string[] | undefined,
  unmasked: boolean,
): [
    Array<SortedGuess>,
    SortType,
    SortVariant,
    (type: SortType) => void,
    string,
    string,
] => {
  const [[sortType, sortVariant], setSort] = useStoredValue<[SortType, SortVariant]>('sort-order', ['order', 'desc']);

  const changeSort = React.useCallback((newSortType: SortType): void => {
    if (sortType !== newSortType) setSort([newSortType, 'asc']);
    else if (sortVariant === 'asc') setSort([sortType, 'desc']);
    else setSort([sortType, 'asc']);
  }, [setSort, sortType, sortVariant]);

  const indexedGuesses: Array<[
    word: string, ordinal: number, isHint: boolean, userName: string | null
  ]> = React.useMemo(() => [
    ...guesses.map<[string, number, boolean, string | null]>(
      ([word, isHint, userName], idx) => [word, idx + 1, isHint, userName],
    ),
    ...(
      unmasked
        ? Object.keys(lexicon)
          .filter((lex) => !freeWords?.includes(lex) && !guesses.some(([gLex]) => lex === gLex))
          .map<[string, number, false, null]>((lex) => [lex, NaN, false, null])
        : []
    ),
  ], [guesses, unmasked, lexicon, freeWords]);

  const sortedGuesses = React.useMemo(() => {
    if (sortType === 'order') {
      return indexedGuesses.sort(([_, a], [__, b]) => orderSort(a, b, sortVariant));
    }
    if (sortType === 'alphabetical') {
      if (sortVariant === 'asc') {
        return indexedGuesses.sort(([a], [b]) => (a < b ? -1 : 1));
      }
      return indexedGuesses.sort(([a], [b]) => (a < b ? 1 : -1));
    }
    if (sortType === 'count') {
      if (sortVariant === 'asc') {
        return indexedGuesses.sort(
          ([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? -1 : 1),
        );
      }
      return indexedGuesses.sort(
        ([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? 1 : -1),
      );
    }
    if (sortType === 'rank') {
      if (sortVariant === 'desc') {
        return indexedGuesses.sort(
          ([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? -1 : 1),
        );
      }
      return indexedGuesses.sort(
        ([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? 1 : -1),
      );
    }
    return indexedGuesses;
  }, [indexedGuesses, lexicon, sortType, sortVariant]);

  const focusIndex = sortedGuesses.findIndex((item) => item[0] === focusWord);
  const nextWord = focusIndex < 0
    ? sortedGuesses[0]?.[0]
    : sortedGuesses[Math.min(sortedGuesses.length - 1, focusIndex + 1)]?.[0];
  const previousWord = focusIndex < 0
    ? sortedGuesses[0]?.[0]
    : sortedGuesses[Math.max(0, focusIndex + 1)]?.[0];

  return [
    sortedGuesses,
    sortType,
    sortVariant,
    changeSort,
    nextWord,
    previousWord,
  ] as const;
};
