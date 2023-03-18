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
    id: 'word-cloud',
    title: 'Word Clouds are still hot',
    content: 'You can now see most of your guesses in a word cloud. On small screens, it\'s only available from the menu. There\'s a setting if you hate it.',
  },
  {
    id: 'never-scroll',
    title: 'Tired of helpful scrolling?',
    content: 'There is now an option to turn off all scrolling on the wiki page. The other scroll options relate to the guesses table.',
  },
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
