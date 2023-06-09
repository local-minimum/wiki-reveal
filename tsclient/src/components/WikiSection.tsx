import {
  SxProps, Typography,
} from '@mui/material';
import { Theme } from '@mui/system';
import * as React from 'react';

import { Section } from '../types/wiki';
import WikiParagraph from './WikiParagraph';
import { wikiPageBGColor } from '../utils/colors';
import { GameMode } from '../api/page';

/* Palette
#25283D
#8F3985
#A675A1
#CEA2AC
#EFD9CE
*/

interface WikiSectionProps {
  section: Section;
  focusWord: string | null;
  scrollToCheck: (isHeader: boolean) => boolean;
  hideWords: string[];
  numberHints: boolean;
  masked: boolean;
  fontSize: number;
  gameMode: GameMode;
}

function getHeader(depth: number) {
  switch (depth) {
    case 0:
      return 'h2';
    case 1:
      return 'h3';
    case 2:
      return 'h4';
    case 3:
      return 'h5';
    default:
      return 'h6';
  }
}

function getFontSize(depth: number, base: number) {
  switch (depth) {
    case 0:
      return `${base + 12}pt`;
    case 1:
      return `${base + 10}pt`;
    case 2:
      return `${base + 8}pt`;
    case 3:
      return `${base + 6}pt`;
    default:
      return `${base + 4}pt`;
  }
}

const commonSX: SxProps<Theme> = {
  // backgroundColor: '#EFD9CE',
  color: '#25283D',
  paddingLeft: 2,
  paddingRight: 2,
  marginTop: 1,
  fontFamily: 'ui-monospace, monospace',
};

function WikiSection({
  section: {
    title, paragraphs, sections, depth,
  },
  focusWord,
  scrollToCheck,
  hideWords,
  masked,
  numberHints,
  fontSize,
  gameMode,
}: WikiSectionProps): JSX.Element {
  const bodySx: SxProps<Theme> = {
    ...commonSX,
    fontSize: `${fontSize}pt`,
    backgroundColor: wikiPageBGColor(gameMode),
  };

  return (
    <>
      <Typography
        variant={getHeader(depth)}
        sx={{ fontSize: getFontSize(depth, fontSize), ...commonSX }}
      >
        <WikiParagraph
          text={title}
          focusWord={focusWord}
          scrollToCheck={scrollToCheck}
          hideWords={hideWords}
          masked={masked}
          isHeader
          numberHints={numberHints}
        />
      </Typography>
      {paragraphs.map((paragraph, idx) => (
        <Typography
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          variant="body1"
          sx={bodySx}
        >
          <WikiParagraph
            text={paragraph}
            focusWord={focusWord}
            scrollToCheck={scrollToCheck}
            hideWords={hideWords}
            masked={masked}
            numberHints={numberHints}
          />
        </Typography>
      ))}
      {
        sections.map((section, idx) => (
          <WikiSection
            section={section}
            focusWord={focusWord}
            scrollToCheck={scrollToCheck}
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
    </>
  );
}

export default WikiSection;
