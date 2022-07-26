import {
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import * as React from 'react';

interface GuessTableProps {
  guesses: string[];
  lexicon: Record<string, number>;
}

type SortType = 'order' | 'alphabetical' | 'count';
type SortVariant = 'asc' | 'desc';

function GuessTable({ guesses, lexicon }: GuessTableProps): JSX.Element {
  const [[sortType, sortVariant], setSort] = React.useState<[SortType, SortVariant]>(['order', 'asc']);

  const changeSort = React.useCallback((newSortType: SortType): void => {
    if (sortType !== newSortType) setSort([newSortType, 'asc']);
    else if (sortVariant === 'asc') setSort([sortType, 'desc']);
    else setSort([sortType, 'asc']);
  }, [sortType, sortVariant]);

  const indexedGuesses = guesses.map((word, idx) => [word, idx + 1]);
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
        return indexedGuesses.sort(([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? -1 : 1));
      }
      return indexedGuesses.sort(([a], [b]) => ((lexicon[a] ?? 0) < (lexicon[b] ?? 0) ? 1 : -1));
    }
    return indexedGuesses;
  }, [indexedGuesses, lexicon, sortType, sortVariant]);

  return (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell onClick={() => changeSort('order')}>#</TableCell>
          <TableCell onClick={() => changeSort('alphabetical')}>Guess</TableCell>
          <TableCell onClick={() => changeSort('count')}>Count</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedGuesses.map(([word, idx]) => (
          <TableRow key={word}>
            <TableCell>{idx}</TableCell>
            <TableCell>{word}</TableCell>
            <TableCell>{lexicon[word] ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default GuessTable;
