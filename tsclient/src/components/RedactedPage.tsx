import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, SxProps, Typography } from '@mui/material';
import { Theme } from '@mui/system';
import * as React from 'react';
import { LexicalizedToken, Section } from '../types/wiki';
import ScrollToTop from './ScrollToTop';

import WikiParagraph from './WikiParagraph';
import WikiSection from './WikiSection';

interface RedactedPageProps {
  title: LexicalizedToken[];
  summary: Array<LexicalizedToken[]>;
  sections: Section[];
  isSolved: boolean;
  language: string | undefined;
  pageName: string | undefined;
  scrollToFocusWordCheck: () => boolean;
  focusWord: string | null;
  containerNode: Node | undefined;
}

const commonSX: SxProps<Theme> = {
  backgroundColor: '#EFD9CE',
  color: '#25283D',
  paddingLeft: 2,
  paddingRight: 2,
  fontFamily: 'monospace',
};

const titleSX: SxProps<Theme> = {
  ...commonSX,
  fontSize: '3rem',
  pt: 1,
};

const summarySX: SxProps<Theme> = {
  ...commonSX,
  fontSize: '1.1rem',
  marginTop: 1,
};

function RedactedPage({
  title, summary, sections, isSolved, language, pageName, scrollToFocusWordCheck, focusWord,
  containerNode,
}: RedactedPageProps): JSX.Element {
  const titleId = 'redacted-article-title';
  return (
    <>
      <Typography variant="h1" sx={titleSX} id={titleId}>
        <WikiParagraph
          text={title}
          focusWord={focusWord}
          scrollToCheck={scrollToFocusWordCheck}
        />
        {isSolved && (
        <Link
          href={`https://${language}.wikipedia.org/wiki/${pageName}`}
          sx={{ color: '#25283D', marginLeft: 1 }}
        >
          <FontAwesomeIcon icon={faLink} />
        </Link>
        )}
      </Typography>
      {
        summary.map((paragraph, idx) => (
          <Typography
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            variant="body1"
            sx={summarySX}
          >
            <WikiParagraph
              text={paragraph}
              focusWord={focusWord}
              scrollToCheck={scrollToFocusWordCheck}
            />
          </Typography>
        ))
      }
      {
        sections.map((section, idx) => (
          <WikiSection
            section={section}
            focusWord={focusWord}
            scrollToCheck={scrollToFocusWordCheck}
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
          />
        ))
      }
      <ScrollToTop topId={titleId} target={containerNode} />
    </>
  );
}

export default RedactedPage;
