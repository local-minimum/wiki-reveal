import {
  SxProps, Typography,
} from '@mui/material';
import * as React from 'react';

import { Section } from '../types/wiki';
import WikiParagraph from './WikiParagraph';

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
  scrollToCheck: () => boolean;
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

function getFontSize(depth: number) {
  switch (depth) {
    case 0:
      return '2.5rem';
    case 1:
      return '2rem';
    case 2:
      return '2.5rem';
    case 3:
      return '2rem';
    default:
      return '1.8rem';
  }
}

function WikiSection({
  section: {
    title, paragraphs, sections, depth,
  },
  focusWord,
  scrollToCheck,
}: WikiSectionProps): JSX.Element {
  const commonSX: Partial<SxProps> = {
    backgroundColor: '#EFD9CE',
    color: '#25283D',
    paddingLeft: 2,
    paddingRight: 2,
    marginTop: 1,
    fontFamily: 'monospace',
  };

  return (
    <>
      <Typography variant={getHeader(depth)} sx={{ fontSize: getFontSize(depth), ...commonSX }}>
        <WikiParagraph text={title} focusWord={focusWord} scrollToCheck={scrollToCheck} />
      </Typography>
      {paragraphs.map((paragraph, idx) => (
        <Typography
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          variant="body1"
          sx={{ fontSize: '1.1rem', ...commonSX }}
        >
          <WikiParagraph text={paragraph} focusWord={focusWord} scrollToCheck={scrollToCheck} />
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
          />
        ))
      }
    </>
  );
}

export default WikiSection;
