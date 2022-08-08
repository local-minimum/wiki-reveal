import {
  RefObject, useCallback, useEffect, useRef,
} from 'react';
import { loadStored } from './loadStored';
import usePrevious from './usePrevious';

function useStoredRef<T>(key: string, defaultValue: T): [RefObject<T>, (newValue: T) => void]
function useStoredRef<T>(
  key: string,
  defaultValue: T | undefined = undefined,
): [RefObject<T | undefined>, (newValue: T) => void] {
  const ref = useRef(loadStored(key, defaultValue));
  const previousKey = usePrevious(key);

  const handleUpdate = useCallback((newValue: T): void => {
    ref.current = newValue;
    if (newValue == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  }, [key]);

  useEffect(() => {
    if (key !== previousKey) {
      ref.current = loadStored(key, defaultValue);
    }
  }, [defaultValue, key, previousKey]);

  return [ref, handleUpdate];
}

export default useStoredRef;
