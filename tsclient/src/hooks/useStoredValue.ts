import { useCallback, useEffect, useState } from 'react';
import { loadStored } from './loadStored';
import usePrevious from './usePrevious';

function useStoredValue<T>(key: string, defaultValue: T): readonly [T, (newValue: T) => void]
function useStoredValue<T>(
  key: string,
  defaultValue: T | undefined = undefined,
):readonly [T | undefined, (newValue: T) => void] {
  const [value, setValue] = useState(() => loadStored(key, defaultValue));
  const previousKey = usePrevious(key);

  useEffect(() => {
    if (key !== previousKey) {
      setValue(loadStored(key, defaultValue));
    }
  }, [defaultValue, key, previousKey]);

  const handleNewValue = useCallback((newValue: T): void => {
    setValue(newValue);
    if (newValue == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  }, [key]);

  return [value, handleNewValue];
}

export default useStoredValue;
