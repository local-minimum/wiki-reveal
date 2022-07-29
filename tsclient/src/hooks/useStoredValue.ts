import { useCallback, useState } from 'react';

function loadStored<T>(key: string, defaultValue: T | undefined): T | undefined {
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return JSON.parse(stored);
}

function useStoredValue<T>(key: string, defaultValue: T): [T, (newValue: T) => void]
function useStoredValue<T>(
  key: string,
  defaultValue: T | undefined = undefined,
):[T | undefined, (newValue: T) => void] {
  const [value, setValue] = useState(loadStored(key, defaultValue));
  const handleNewValue = useCallback((newValue: T): void => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, handleNewValue];
}

export default useStoredValue;
