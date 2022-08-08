import { useEffect, useState } from 'react';
import { Guess } from '../components/Guess';
import { Page } from '../types/wiki';
import { unmaskPage } from '../utils/wiki';
import usePrevious from './usePrevious';

const emptyPage: Page = { title: [], summary: [], sections: [] };

function useArrDiff(current: Guess[]): Guess[] {
  const prev = usePrevious(current) ?? [];
  return current.filter(([lex], idx) => lex !== prev[idx]?.[0]);
}

function useRevealedPage(
  page: Page | undefined,
  guesses: Guess[],
  unmasked: boolean,
): Page {
  const prevPage = usePrevious(page);
  const pageChange = prevPage !== page && prevPage !== undefined;
  const [revealed, setRevealed] = useState<Page>(page ?? emptyPage);
  const newGuesses = useArrDiff(guesses);

  useEffect(() => {
    setRevealed(page ?? emptyPage);
  }, [page]);

  useEffect(() => {
    if (pageChange || (newGuesses.length === 0 && !unmasked)) return;

    const updated = unmaskPage(
      revealed,
      Object.fromEntries(newGuesses.map(([lex]) => [lex, true])),
      unmasked,
    );
    setRevealed(updated);
  }, [newGuesses, pageChange, revealed, unmasked]);

  return revealed;
}

export default useRevealedPage;
