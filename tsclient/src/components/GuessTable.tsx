import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import * as React from 'react';
import SortIcon from './SortIcon';

interface GuessTableProps {
  guesses: Array<[name: string, isHint: boolean]>;
  lexicon: Record<string, number>;
  onSetFocusWord: (word: string) => void;
  focusWord: string | null;
}

type SortType = 'order' | 'alphabetical' | 'count';
type SortVariant = 'asc' | 'desc';

function GuessTable({
  guesses, lexicon, onSetFocusWord, focusWord,
}: GuessTableProps): JSX.Element {
  const [[sortType, sortVariant], setSort] = React.useState<[SortType, SortVariant]>(['order', 'asc']);

  const changeSort = React.useCallback((newSortType: SortType): void => {
    if (sortType !== newSortType) setSort([newSortType, 'asc']);
    else if (sortVariant === 'asc') setSort([sortType, 'desc']);
    else setSort([sortType, 'asc']);
  }, [sortType, sortVariant]);

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
    return indexedGuesses;
  }, [indexedGuesses, lexicon, sortType, sortVariant]);

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
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedGuesses.map(([word, ordinal, isHint]) => {
            const focused = word === focusWord;
            return (
              <TableRow
                key={word}
                sx={{ backgroundColor: focused ? '#CEA2AC' : undefined, cursor: 'pointer' }}
                onClick={() => onSetFocusWord(word)}
              >
                <TableCell>{ordinal}</TableCell>
                <TableCell>
                  {word}
                  <Box sx={{ float: 'right' }}>
                    {isHint && (
                      <Tooltip title="Word gotten as a hint">
                        <FontAwesomeIcon icon={faPuzzlePiece} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{lexicon[word] ?? 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GuessTable;
