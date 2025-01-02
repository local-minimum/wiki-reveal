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
    id: 'keyboardians',
    title: 'Keyboardians rejoice!',
    content: 'While having the input field in focus, it is now possible to use up and down arrows to change focus word. Also, pressing enter while input is empty will cycle through the hits of the focus word.',
  },
  {
    id: 'time-zone-offset',
    title: 'Game should now reset GMT-5',
    content: 'Some people have complained about when the new day starts, now it starts later.',
  },
  {
    id: 'game-mode-feedback',
    title: 'Info about how/what you play in guess field',
    content: 'There are now some helpful icons with tooltips if you are playing yesterdays game or with spell assistance.',
  },
  // id: 'auto-guess',
  // id: 'letter-count',
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
