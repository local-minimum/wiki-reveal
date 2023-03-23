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
    id: 'timer',
    title: 'You can now see the time elapsed (or not)',
    content: 'There\'s a timer (that can be hidden in the settings) for those of us that are more interested in fast than accurate play',
  },
  {
    id: 'number-hints',
    title: 'See length of hidden word',
    content: 'Because it is annoying to count length on mobile.',
  },
  {
    id: 'game-stats',
    title: 'Cool info about your current game',
    content: 'From the menu you can access a section with various neat info about the current game',
  },
  {
    id: 'word-cloud',
    title: 'Word Clouds are still hot',
    content: 'You can now see most of your guesses in a word cloud. There\'s a setting to disable if you hate it.',
  },
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
