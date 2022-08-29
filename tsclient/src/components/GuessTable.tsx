import { faHeading, faPuzzlePiece, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  useMediaQuery, useTheme,
} from '@mui/material';
import * as React from 'react';
import { GameMode } from '../api/page';
import usePrevious from '../hooks/usePrevious';
import useStoredValue from '../hooks/useStoredValue';
import { initials, stringToColor } from '../utils/avatar';
import { Guess } from './Guess';
import { UserSettings } from './menu/UserOptions';
import ScrollToTop from './ScrollToTop';
import SortIcon from './SortIcon';

interface GuessTableProps {
  guesses: Array<Guess>;
  lexicon: Record<string, number>;
  rankings: Record<string, number>;
  onSetFocusWord: (word: string, requireHeader: boolean) => void;
  focusWord: string | null;
  titleLexes: string[];
  headingLexes: string[];
  gameMode: GameMode;
  userSettings: UserSettings;
  unmasked: boolean;
  freeWords: string[] | undefined;
}

type SortType = 'order' | 'alphabetical' | 'count' | 'rank';
type SortVariant = 'asc' | 'desc';

function orderSort(a: number, b: number, mode: 'asc' | 'desc'): 1 | -1 {
  if (Number.isNaN(a)) return 1;
  if (Number.isNaN(b)) return -1;
  if (mode === 'desc') {
    return a > b ? 1 : -1;
  }
  return a > b ? -1 : 1;
}

function GuessTable({
  guesses, lexicon, onSetFocusWord, focusWord, titleLexes, headingLexes,
  rankings, gameMode, userSettings, unmasked, freeWords,
}: GuessTableProps): JSX.Element {
  const { autoScrollGuess, autoScrollGuessCoop } = userSettings;
  const autoScroll = gameMode === 'coop' ? autoScrollGuessCoop : autoScrollGuess;
  const mostRecentGuess = guesses[guesses.length - 1]?.[0];
  const previousGuess = usePrevious(mostRecentGuess);
  const mostRecentGuessRef = React.useRef<HTMLTableRowElement | null>(null);
  const focusGuessRef = React.useRef<HTMLTableRowElement | null>(null);
  const previousFocusWord = usePrevious(focusWord);

  React.useEffect(() => {
    if (!autoScroll) return;
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
  }, [focusWord, mostRecentGuess, previousFocusWord, previousGuess, autoScroll]);

  const refOrNull = (
    isMostRecent: boolean,
    isFocus: boolean,
  ): React.Ref<HTMLTableRowElement> | null => {
    if (isMostRecent) return mostRecentGuessRef;
    if (isFocus) return focusGuessRef;
    return null;
  };

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

  const theme = useTheme();
  const isCramped = useMediaQuery(theme.breakpoints.down('lg'));

  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  const firstRowId = 'first-guess-row';
  const [showSort, setShowSort] = React.useState(false);

  return (
    <TableContainer sx={{ height: '100%' }} ref={tableContainerRef}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow
            sx={{ cursor: 'pointer' }}
            onMouseEnter={() => setShowSort(true)}
            onMouseLeave={() => setShowSort(false)}
          >
            <TableCell
              onClick={() => changeSort('order')}
              title="Guess order"
            >
              #
              {(showSort || !isCramped) && (
                <Box component="span" sx={{ float: 'right' }}>
                  <SortIcon filter="order" sortType={sortType} sortVariant={sortVariant} />
                </Box>
              )}
            </TableCell>
            <TableCell
              onClick={() => changeSort('alphabetical')}
              title="The lexical entry of your guess (lower case and removing diacritics)."
            >
              Guess
              {(showSort || !isCramped) && (
                <Box component="span" sx={{ float: 'right' }}>
                  <SortIcon filter="alphabetical" sortType={sortType} sortVariant={sortVariant} />
                </Box>
              )}
            </TableCell>
            <TableCell
              onClick={() => changeSort('count')}
              title="Number of occurances (if any) in article."
            >
              {isCramped ? 'n' : 'Count' }
              {(showSort || !isCramped) && (
                <Box component="span" sx={{ float: 'right' }}>
                  <SortIcon filter="count" sortType={sortType} sortVariant={sortVariant} />
                </Box>
              )}
            </TableCell>
            <TableCell
              title="Most frequent word has rank 1, second most rank 2 and so on."
              onClick={() => changeSort('rank')}
            >
              Rank
              {(showSort || !isCramped) && (
                <Box component="span" sx={{ float: 'right' }}>
                  <SortIcon filter="rank" sortType={sortType} sortVariant={sortVariant} />
                </Box>
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedGuesses.map(([word, ordinal, isHint, userName], idx) => {
            if (word === '') return null;
            const focused = word === focusWord;
            const missedEntry = Number.isNaN(ordinal);
            const mostRecent = ordinal === sortedGuesses.length;

            return (
              <TableRow
                id={idx === 0 ? firstRowId : undefined}
                key={word}
                sx={{
                  backgroundColor: focused ? '#CEA2AC' : undefined,
                  cursor: 'pointer',
                  '*': {
                    color: missedEntry ? '#AA7777' : undefined,
                  },
                }}
                onClick={() => onSetFocusWord(word, false)}
                ref={refOrNull(mostRecent, focused)}
              >
                <TableCell>{missedEntry ? <small><i>N/A</i></small> : ordinal}</TableCell>
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
                      <IconButton
                        title="Word part of sub-heading"
                        onClick={(evt) => {
                          onSetFocusWord(word, true);
                          evt.stopPropagation();
                        }}
                        sx={{
                          lineHeight: 1.43,
                          fontSize: '0.875rem',
                          padding: 0,
                          color: 'rgba(0, 0, 0, 0.87)',
                        }}
                      >
                        <FontAwesomeIcon icon={faHeading} />
                      </IconButton>
                    )}
                    {isHint && (
                      <Tooltip title="Word gotten as a hint">
                        <FontAwesomeIcon icon={faPuzzlePiece} />
                      </Tooltip>
                    )}
                    {gameMode === 'coop' && userName != null && (
                      <Avatar
                        sx={{
                          bgcolor: stringToColor(userName),
                          height: 24,
                          width: 24,
                          fontSize: '0.75rem',
                        }}
                        alt={userName}
                      >
                        {initials(userName)}
                      </Avatar>
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
      <ScrollToTop
        size={2}
        margin={8}
        target={tableContainerRef.current ?? undefined}
        topId={firstRowId}
      />
    </TableContainer>
  );
}

export default GuessTable;
