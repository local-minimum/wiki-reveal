import { useCallback, useMemo } from 'react';
import useStoredValue from './useStoredValue';

export interface NewsItem {
  id: string;
  title: string;
  content: string | JSX.Element | JSX.Element[]
}

interface News {
  news: NewsItem[];
  onRead: () => void;
}

const news: NewsItem[] = [
  {
    id: 'game-mode-feedback',
    title: 'Info about how/what you play in guess field',
    content: 'There are now some helpful icons with tooltips if you are playing yesterdays game or with spell assistance.',
  },
  {
    id: 'auto-guess',
    title: 'Stop inputing filler words',
    content: 'You now have the option to guess sets of common filler words from the pen icon in the input field.',
  },
  {
    id: 'letter-count',
    title: 'Stop counting letters',
    content: 'You can now directly see in the guess field how long the guess is',
  },
  // id: 'guess-progression',
  // id: 'timer',
  // id: 'number-hints',
  // id: 'game-stats',
  // id: 'word-cloud',
  // id: 'never-scroll',
  // id: 'spell-assist',
  // id: 'expressions',
  // id: 'hints-coop',
  // id: 'hints-settings',
  // id: 'reveal-words',
  // id: 'coop-updates',
  // id: 'better-hints',
  // id: 'header-matches',
  // id: 'mobile-space',
  // id: 'user-settings',
];

export default function useNews(): News {
  const [read, setRead] = useStoredValue<string[]>('read-news', []);

  const unreadNews = useMemo(
    () => news.filter(({ id }) => !read.includes(id)),
    [read],
  );
  const handleRead = useCallback(() => {
    setRead(news.map(({ id }) => id));
  }, [setRead]);

  return {
    news: unreadNews,
    onRead: handleRead,
  };
}
