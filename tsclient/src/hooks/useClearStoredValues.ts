import { useEffect } from 'react';
import useStoredValue from './useStoredValue';

function useClearStoredValues(gameId: number | undefined, keysToClear: string[], cacheSize = 2) {
  const [stored, setStored] = useStoredValue<number[]>('storage-cache', []);
  useEffect(() => {
    if (gameId === undefined || stored.includes(gameId)) return;

    const startIndex = Math.max(0, stored.indexOf(gameId) - cacheSize);
    stored
      .slice(0, startIndex)
      .forEach((storedGameId) => keysToClear.forEach((key) => localStorage.removeItem(`${key}-${storedGameId}`)));

    const remaining = [...stored.slice(startIndex), gameId];
    setStored(remaining);
  }, [cacheSize, gameId, keysToClear, setStored, stored]);
}

export default useClearStoredValues;
