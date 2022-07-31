import { allowedWords } from '../data/allowedWords';
import { LexicalizedToken, Page, Section } from '../types/wiki';
import { createLexicon } from '../utils/lexicon';
import {
  splitParagraphs, trimSections, unmaskPage, wordAsLexicalEntry,
} from '../utils/wiki';

type Token = [token: string, isHidden: boolean];

interface ResponseSection {
  title: Token[];
  depth: number;
  paragraphs: Token[];
  sections: ResponseSection[];
}

interface ResponsePage {
  title: Token[];
  summary: Token[];
  sections: ResponseSection[];
}

interface ResponseJSON {
  language: string;
  gameId: number;
  page: ResponsePage;
}

function lexicalizeToken([word, isHidden]: Token): LexicalizedToken {
  return [word, isHidden, isHidden ? wordAsLexicalEntry(word) : word];
}

function transformSection({
  title, paragraphs, depth, sections,
}: ResponseSection): Section {
  return {
    title: title.map((token) => lexicalizeToken(token)),
    depth,
    paragraphs: splitParagraphs(paragraphs.map((token) => lexicalizeToken(token))),
    sections: sections.map((section) => transformSection(section)),
  };
}

function transformPage({ title, summary, sections }: ResponsePage): Page {
  return {
    title: title.map((token) => lexicalizeToken(token)),
    summary: splitParagraphs(summary.map((token) => lexicalizeToken(token))),
    sections: sections.map((section) => transformSection(section)),
  };
}

export function getPage() {
  return fetch('/api/page')
    .then(((result): Promise<ResponseJSON> => {
      if (result.ok) return result.json();
      throw new Error('Failed to download page');
    }))
    .then((data) => {
      const page = transformPage(data.page);
      page.sections = trimSections(page.sections);
      const lexicon = createLexicon(page);
      const freeWords = allowedWords[data.language] ?? [];
      return {
        page: unmaskPage(page, freeWords),
        lexicon,
        freeWords,
        gameId: data.gameId,
      };
    });
}
