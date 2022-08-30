import { useEffect, useRef, useState } from 'react';
import { Guess } from '../components/Guess';
import { Page } from '../types/wiki';
import { unmaskPage } from '../utils/wiki';
import usePrevious from './usePrevious';

const emptyPage: Page = { title: [], summary: [], sections: [] };

function useRevealedPage(
  page: Page | undefined,
  guesses: Guess[],
): Page {
  const prevPage = usePrevious(page);
  const pageChange = prevPage !== page;
  const [revealed, setRevealed] = useState<Page>(page ?? emptyPage);
  const guessesRef = useRef<Guess[]>([]);

  useEffect(() => {
    if (pageChange) {
      setRevealed(page ?? emptyPage);
      guessesRef.current = [];
      return;
    }
    const divergenceIdx = guesses.findIndex(([lex], idx) => lex !== guessesRef.current[idx]?.[0]);
    if (guessesRef.current.length > divergenceIdx + 1) {
      if (divergenceIdx >= 0 || guesses.length !== guessesRef.current.length) {
        setRevealed(page ?? emptyPage);
        guessesRef.current = [];
      }
      return;
    }
    if (divergenceIdx < 0) {
      return;
    }
    const newGuesses = guesses.slice(divergenceIdx);
    guessesRef.current = guesses;
    if (newGuesses.length === 0) return;

    const updated = unmaskPage(
      revealed,
      Object.fromEntries(newGuesses.map(([lex]) => [lex, true])),
    );
    setRevealed(updated);
  }, [guesses, pageChange, revealed, page]);

  return revealed;
}

export default useRevealedPage;
