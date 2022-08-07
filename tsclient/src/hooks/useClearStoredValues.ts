import { useEffect } from 'react';
import useStoredValue from './useStoredValue';

function useClearStoredValues(
  gameId: number | undefined,
  keysToClear: string[],
  isCoop = false,
  cacheSize = 2,
) {
  const [stored, setStored] = useStoredValue<number[]>('storage-cache', []);
  useEffect(() => {
    if (isCoop === false || gameId === undefined || stored.includes(gameId)) return;

    const startIndex = Math.max(0, stored.indexOf(gameId) - cacheSize);
    stored
      .slice(0, startIndex)
      .forEach((storedGameId) => keysToClear.forEach((key) => localStorage.removeItem(`${key}-${storedGameId}`)));

    const remaining = [...stored.slice(startIndex), gameId];
    setStored(remaining);
  }, [cacheSize, gameId, isCoop, keysToClear, setStored, stored]);
}

export default useClearStoredValues;
