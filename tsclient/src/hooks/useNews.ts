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
    id: 'spell-assist',
    title: 'Optional spelling assistance',
    content: 'A basic assistance with spelling or possibly alternative hinting system is now available in the settings. Note that it is rather agressive in assisting.',
  },
  {
    id: 'expressions',
    title: 'Omitted expressions',
    content: 'Inline equations, formula and similar features of the wikipedia article are removed, but now they are indicated with a special formatted word: "EXPRESSION"',
  },
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
