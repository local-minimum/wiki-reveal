import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, SxProps, Typography } from '@mui/material';
import { Theme } from '@mui/system';
import * as React from 'react';
import { LexicalizedToken, Section } from '../types/wiki';
import ScrollToTop from './ScrollToTop';

import WikiParagraph from './WikiParagraph';
import WikiSection from './WikiSection';
import { wikiPageBGColor } from '../utils/colors';
import { GameMode } from '../api/page';

interface RedactedPageProps {
  title: LexicalizedToken[];
  summary: Array<LexicalizedToken[]>;
  sections: Section[];
  isSolved: boolean;
  language: string | undefined;
  pageName: string | undefined;
  scrollToFocusWordCheck: (isHeader: boolean) => boolean;
  scrollButtonYOffset?: string;
  focusWord: string | null;
  containerNode?: Node;
  hideWords: string[];
  masked: boolean;
  numberHints: boolean;
  fontSize: number;
  gameMode: GameMode;
}

const commonSX: SxProps<Theme> = {
  color: '#25283D',
  paddingLeft: 2,
  paddingRight: 2,
  fontFamily: 'ui-monospace, monospace',
};

function RedactedPage({
  title, summary, sections, isSolved, language, pageName, scrollToFocusWordCheck, focusWord,
  containerNode, hideWords, masked, scrollButtonYOffset, numberHints, fontSize, gameMode,
}: RedactedPageProps): JSX.Element {
  const titleSX: SxProps<Theme> = {
    ...commonSX,
    fontSize: `${fontSize + 18}pt`,
    pt: 1,
    backgroundColor: wikiPageBGColor(gameMode),
  };

  const summarySX: SxProps<Theme> = {
    ...commonSX,
    fontSize: `${fontSize}pt`,
    marginTop: 1,
    backgroundColor: wikiPageBGColor(gameMode),
  };

  const titleId = 'redacted-article-title';
  return (
    <>
      <Typography variant="h1" sx={titleSX} id={titleId}>
        <WikiParagraph
          masked={masked}
          text={title}
          focusWord={focusWord}
          scrollToCheck={scrollToFocusWordCheck}
          hideWords={hideWords}
          isHeader
          numberHints={numberHints}
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
              hideWords={hideWords}
              masked={masked}
              numberHints={numberHints}
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
            hideWords={hideWords}
            masked={masked}
            numberHints={numberHints}
            fontSize={fontSize}
            gameMode={gameMode}
          />
        ))
      }
      <ScrollToTop topId={titleId} target={containerNode} yOffset={scrollButtonYOffset} />
    </>
  );
}

export default RedactedPage;
