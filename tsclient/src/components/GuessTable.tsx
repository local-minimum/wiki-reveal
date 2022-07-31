import { faHeading, faPuzzlePiece, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import * as React from 'react';
import usePrevious from '../hooks/usePrevious';
import useStoredValue from '../hooks/useStoredValue';
import SortIcon from './SortIcon';

interface GuessTableProps {
  guesses: Array<[name: string, isHint: boolean]>;
  lexicon: Record<string, number>;
  freeWords: string[] | undefined;
  onSetFocusWord: (word: string) => void;
  focusWord: string | null;
  titleLexes: string[];
  headingLexes: string[];
}

type SortType = 'order' | 'alphabetical' | 'count' | 'rank';
type SortVariant = 'asc' | 'desc';

function GuessTable({
  guesses, lexicon, onSetFocusWord, focusWord, freeWords, titleLexes, headingLexes,
}: GuessTableProps): JSX.Element {
  const mostRecentGuess = guesses[guesses.length - 1]?.[0];
  const previousGuess = usePrevious(mostRecentGuess);
  const mostRecentGuessRef = React.useRef<HTMLTableRowElement | null>(null);
  const focusGuessRef = React.useRef<HTMLTableRowElement | null>(null);
  const previousFocusWord = usePrevious(focusWord);

  React.useEffect(() => {
    if (mostRecentGuess !== previousGuess) {
      mostRecentGuessRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (focusWord !== previousFocusWord) {
      focusGuessRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusWord, mostRecentGuess, previousFocusWord, previousGuess]);

  const refOrNull = (
    isMostRecent: boolean,
    isFocus: boolean,
  ): React.Ref<HTMLTableRowElement> | null => {
    if (isMostRecent) return mostRecentGuessRef;
    if (isFocus) return focusGuessRef;
    return null;
  };

  const [[sortType, sortVariant], setSort] = useStoredValue<[SortType, SortVariant]>('sort-order', ['order', 'asc']);

  const changeSort = React.useCallback((newSortType: SortType): void => {
    if (sortType !== newSortType) setSort([newSortType, 'asc']);
    else if (sortVariant === 'asc') setSort([sortType, 'desc']);
    else setSort([sortType, 'asc']);
  }, [setSort, sortType, sortVariant]);

  const indexedGuesses: Array<[
    word: string, ordinal: number, isHint: boolean
  ]> = guesses
    .map(([word, isHint], idx) => [word, idx + 1, isHint]);
  const sortedGuesses = React.useMemo(() => {
    if (sortType === 'order') {
      if (sortVariant === 'desc') {
        const newGuesses = [...indexedGuesses];
        newGuesses.reverse();
        return newGuesses;
      }
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

  const rankings = React.useMemo(() => {
    const sorted: Array<[string, number]> = [...Object.entries(lexicon)]
      .filter(([word]) => !(freeWords?.includes(word) ?? false))
      .sort(([, a], [, b]) => (a < b ? 1 : -1));
    return Object.fromEntries(sorted.map(([word], idx) => [word, idx + 1]));
  }, [freeWords, lexicon]);

  return (
    <TableContainer sx={{ height: '100%' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ cursor: 'pointer' }}>
            <TableCell onClick={() => changeSort('order')}>
              #
              <Box component="span" sx={{ float: 'right' }}>
                <SortIcon filter="order" sortType={sortType} sortVariant={sortVariant} />
              </Box>
            </TableCell>
            <TableCell onClick={() => changeSort('alphabetical')}>
              Guess
              <Box component="span" sx={{ float: 'right' }}>
                <SortIcon filter="alphabetical" sortType={sortType} sortVariant={sortVariant} />
              </Box>
            </TableCell>
            <TableCell onClick={() => changeSort('count')}>
              Count
              <Box component="span" sx={{ float: 'right' }}>
                <SortIcon filter="count" sortType={sortType} sortVariant={sortVariant} />
              </Box>
            </TableCell>
            <TableCell
              title="Most frequent word has rank 1, second most rank 2 and so on."
              onClick={() => changeSort('rank')}
            >
              Rank
              <Box component="span" sx={{ float: 'right' }}>
                <SortIcon filter="rank" sortType={sortType} sortVariant={sortVariant} />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedGuesses.map(([word, ordinal, isHint]) => {
            const focused = word === focusWord;
            const mostRecent = ordinal === sortedGuesses.length;

            return (
              <TableRow
                key={word}
                sx={{
                  backgroundColor: focused ? '#CEA2AC' : undefined,
                  cursor: 'pointer',
                }}
                onClick={() => onSetFocusWord(word)}
                ref={refOrNull(mostRecent, focused)}
              >
                <TableCell>{ordinal}</TableCell>
                <TableCell
                  sx={{ fontWeight: mostRecent ? 600 : undefined }}
                >
                  {word}
                  <Box
                    sx={{
                      float: 'right', display: 'flex', flexDirection: 'row', gap: 0.5,
                    }}
                  >
                    {titleLexes.includes(word) && (
                      <Tooltip title="Word part of page title">
                        <FontAwesomeIcon icon={faStar} />
                      </Tooltip>
                    )}
                    {headingLexes.includes(word) && (
                      <Tooltip title="Word part of sub-heading">
                        <FontAwesomeIcon icon={faHeading} />
                      </Tooltip>
                    )}
                    {isHint && (
                      <Tooltip title="Word gotten as a hint">
                        <FontAwesomeIcon icon={faPuzzlePiece} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{lexicon[word] ?? 0}</TableCell>
                <TableCell>{rankings[word] ?? <small><i>N/A</i></small>}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GuessTable;
