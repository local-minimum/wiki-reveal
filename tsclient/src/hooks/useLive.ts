import { useEffect, useState } from 'react';

function useLive(intervalMS = 1000): number {
  const [time, setTime] = useState<number>(Date.now());
  useEffect(
    () => {
      const interval = setInterval(() => setTime(Date.now()), intervalMS);
      return () => clearInterval(interval);
    },
    [intervalMS],
  );
  return time;
}

export default useLive;
