import {
  LexicalizedToken, Page, Section,
} from '../types/wiki';

export function wordAsLexicalEntry(word: string): string {
  return word.toLowerCase()
    .replace(/[àáâäæãåā]/g, 'a')
    .replace(/[çćč]/g, 'c')
    .replace(/[èéêëēėę]/g, 'e')
    .replace(/[ł]/g, 'l')
    .replace(/[îïíīįì]/g, 'i')
    .replace(/[ñń]/g, 'n')
    .replace(/[ôöòóœøōõ]/g, 'o')
    .replace(/[ßśš]/g, 's')
    .replace(/[ûüùúū]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[žźż]/g, 'z');
}

function unmaskTokens(tokens: LexicalizedToken[], words: string[]): LexicalizedToken[] {
  return tokens.map(([token, isHidden, lex]) => (
    isHidden && words.some((word) => word === lex) ? [token, false, lex] : [token, isHidden, lex]
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

export function splitParagraphs(text: LexicalizedToken[]): Array<LexicalizedToken[]> {
  const out: Array<LexicalizedToken[]> = [];
  let start = 0;
  text.forEach(([value, isHidden, lex], idx) => {
    if (!isHidden && value.includes('\n')) {
      out.push([...text.slice(start, idx), [value.slice(0, value.indexOf('\n')), isHidden, lex]]);
      start = idx + 1;
    }
  });
  if (start < text.length - 1) {
    out.push(text.slice(start));
  }
  return out;
}

export function trimSections(sections: Section[]): Section[] {
  let include = true;
  const trimAt = ['references', 'see also', 'notes', 'external links'];

  return sections.filter(({ title }) => {
    if (!include) return false;
    const t = title.filter(([, isHidden]) => isHidden).map(([_, __, lex]) => lex).join(' ');
    if (trimAt.includes(t)) {
      include = false;
    }
    return include;
  });
}
