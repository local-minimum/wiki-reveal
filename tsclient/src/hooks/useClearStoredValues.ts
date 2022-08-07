import { useEffect } from 'react';
import useStoredValue from './useStoredValue';

function useClearStoredValues(
  gameId: number | undefined,
  keysToClear: string[],
  isCoop = false,
  cacheSize = 2,
) {
  const [stored, setStored] = useStoredValue<number[]>('storage-cache', []);
  const [storedCoop, setStoredCoop] = useStoredValue<number[]>('storage-cache-coop', []);

  useEffect(() => {
    if (gameId === undefined || stored.includes(gameId)) return;

    if (!isCoop) {
      const startIndex = Math.max(0, stored.indexOf(gameId) - cacheSize);
      stored
        .slice(0, startIndex)
        .forEach((storedGameId) => keysToClear.forEach((key) => localStorage.removeItem(`${key}-${storedGameId}`)));
      const remaining = [...stored.slice(startIndex), gameId];
      setStored(remaining);
    } else {
      const startIndex = Math.max(0, storedCoop.indexOf(gameId) - cacheSize);
      storedCoop
        .slice(0, startIndex)
        .forEach((storedGameId) => keysToClear.forEach((key) => localStorage.removeItem(`${key}-${storedGameId}`)));
      const remaining = [...storedCoop.slice(startIndex), gameId];
      setStoredCoop(remaining);
    }
  }, [cacheSize, gameId, isCoop, keysToClear, setStored, setStoredCoop, stored, storedCoop]);
}

export default useClearStoredValues;
