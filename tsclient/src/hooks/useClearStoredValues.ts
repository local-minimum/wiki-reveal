import { useEffect } from 'react';
import { GameMode } from '../api/page';
import useStoredValue from './useStoredValue';

function useClearStoredValues(
  gameId: number | undefined,
  keysToClear: string[],
  gameMode: GameMode,
  cacheSize = 2,
) {
  const [storedSingle, setStoredSingle] = useStoredValue<number[]>('storage-cache', []);
  const [storedCoop, setStoredCoop] = useStoredValue<number[]>('storage-cache-coop', []);

  useEffect(
    () => {
      const coopOrSolo = gameMode === 'coop' ? 'coop' : 'solo';
      const stored = gameMode === 'coop' ? storedCoop : storedSingle;
      const setStored = gameMode === 'coop' ? setStoredCoop : setStoredSingle;
      if (gameId === undefined || stored.includes(gameId)) return;

      const keepFrom = Math.max(0, stored.length - Math.min(cacheSize, stored.length));
      stored
        .slice(0, keepFrom)
        .forEach((storedGameId) => keysToClear.forEach((key) => {
          // Remove per coop / solo
          localStorage.removeItem(`${key}-${coopOrSolo}-${storedGameId}`);
          // Remove per gameMode
          localStorage.removeItem(`${key}-${gameMode}-${storedGameId}`);
        }));
      const remaining = [...stored.slice(keepFrom), gameId];
      setStored(remaining);
    },
    [
      cacheSize, gameId, gameMode, keysToClear, setStoredCoop, setStoredSingle, storedCoop,
      storedSingle,
    ],
  );
}

export default useClearStoredValues;
