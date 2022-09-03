import { LexicalizedToken, Page, Section } from '../types/wiki';

function updateLexiconForSection(
  { title, paragraphs, sections }: Section,
  updateLexicon: (token: LexicalizedToken) => void,
): void {
  title.forEach(updateLexicon);
  paragraphs.forEach((paragraph) => paragraph.forEach(updateLexicon));
  sections.forEach((section) => updateLexiconForSection(section, updateLexicon));
}

export function createLexicon({ title, summary, sections }: Page): Record<string, number> {
  const lexicon: Record<string, number> = {};

  const updateLexicon = ([, isHidden, entry]: LexicalizedToken) => {
    if (isHidden && entry !== null) {
      const cur = lexicon[entry];
      if (cur === undefined) {
        lexicon[entry] = 1;
      } else {
        lexicon[entry] += 1;
      }
    }
  };

  title.forEach(updateLexicon);
  summary.forEach((paragraph) => paragraph.forEach(updateLexicon));
  sections.forEach((section) => updateLexiconForSection(section, updateLexicon));

  return lexicon;
}
