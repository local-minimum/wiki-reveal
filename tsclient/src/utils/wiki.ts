import { Page, Section, Token } from '../types/wiki';

function unmaskTokens(tokens: Token[], words: string[]): Token[] {
  return tokens.map(([token, isHidden]) => (
    isHidden && words.some((word) => word === token) ? [token, false] : [token, isHidden]
  ));
}

function unMaskSection({
  title, depth, paragraphs, sections,
}: Section, words: string[]): Section {
  return {
    title: unmaskTokens(title, words),
    depth,
    paragraphs: paragraphs.map((paragraph) => unmaskTokens(paragraph, words)),
    sections: sections.map((section) => unMaskSection(section, words)),
  };
}

export function unmaskPage({ title, summary, sections }: Page, words: string[]): Page {
  return {
    title: unmaskTokens(title, words),
    summary: summary.map((paragraph) => unmaskTokens(paragraph, words)),
    sections: sections.map((section) => unMaskSection(section, words)),
  };
}

export function splitParagraphs(text: Token[]): Array<Token[]> {
  const out: Array<Token[]> = [];
  let start = 0;
  text.forEach(([value, isHidden], idx) => {
    if (!isHidden && value.includes('\n')) {
      out.push([...text.slice(start, idx), [value.slice(0, value.indexOf('\n')), isHidden]]);
      start = idx + 1;
    }
  });
  if (start < text.length - 1) {
    out.push(text.slice(start));
  }
  return out;
}
