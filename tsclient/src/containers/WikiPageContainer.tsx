import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPage } from '../api/page';
import WikiPage from '../components/WikiPage';
import { Section } from '../types/wiki';
import uniq from '../utils/uniq';

function WikiPageContainer(): JSX.Element {
  const { isLoading, isError, data } = useQuery(
    ['page'],
    getPage,
  );
  const {
    page, freeWords, lexicon, gameId, language, pageName, yesterdaysTitle,
    start, end,
  } = data ?? { lexicon: {} as Record<string, number> };

  const [titleLexes, headingLexes] = React.useMemo(() => {
    const getSectionLexes = (sections: Section[]): string[] => sections
      .map((section) => [
        ...section.title
          .filter(([, isHidden]) => isHidden)
          .map(([_, __, lex]) => lex),
        ...getSectionLexes(section.sections),
      ]).flat();

    const titleWords = page?.title
      .filter(([, isHidden]) => isHidden)
      .map(([_, __, lex]) => lex) ?? [];

    return [
      uniq(titleWords),
      uniq(getSectionLexes(page?.sections ?? [])),
    ];
  }, [page]);

  return (
    <WikiPage
      isLoading={isLoading}
      isError={isError}
      freeWords={freeWords}
      lexicon={lexicon}
      gameId={gameId}
      language={language}
      pageName={pageName}
      page={page}
      titleLexes={titleLexes}
      headingLexes={headingLexes}
      yesterdaysTitle={yesterdaysTitle}
      start={start}
      end={end}
    />
  );
}

export default WikiPageContainer;
