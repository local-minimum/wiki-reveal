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
    id: 'user-settings',
    title: 'Introducing user settings',
    content: 'Some basic configurations are now available in the menu. More might come...',
  },
  {
    id: 'mobile-space',
    title: 'Mayhaps it works in more mobile browsers',
    content: 'I really don\'t know much about layouting and mobile things seems to be a can of worms... But there is a new setting that may help.',
  },
  {
    id: 'header-matches',
    title: 'Quick scroll to header matches',
    content: 'When guesses show the "H" header match icon, it can now be clicked to scroll through those header matches only.',
  },
];

export default function useNews(): News {
  const [read, setRead] = useStoredValue<string[]>('read-news', []);

  const unreadNews = useMemo(() => news.filter(({ id }) => !read.includes(id)), [read]);
  const handleRead = useCallback(() => {
    setRead(news.map(({ id }) => id));
  }, [setRead]);

  return {
    news: unreadNews,
    onRead: handleRead,
  };
}
