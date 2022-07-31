import { useEffect, useRef } from 'react';

function usePrevious<T>(current: T): T | undefined {
  const ref = useRef<T | undefined>();
  useEffect(() => {
    ref.current = current;
  }, [current]);
  return ref.current;
}

export default usePrevious;
