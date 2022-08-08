import { useCallback, useRef, useState } from 'react';

interface Transaction {
  readonly resetTransactions: () => void;
  readonly endTransaction: () => void;
}

export default function useTransaction(): Transaction {
  const transactionRef = useRef(0);
  const [, setTransaction] = useState<number>(0);
  const resetTransactions = useCallback(() => {
    transactionRef.current = 0;
    setTransaction(0);
  }, []);
  const endTransaction = useCallback(() => {
    transactionRef.current += 1;
    setTransaction(transactionRef.current);
  }, []);

  return { resetTransactions, endTransaction };
}
