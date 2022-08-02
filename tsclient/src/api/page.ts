import { allowedWords } from '../data/allowedWords';
import { LexicalizedToken, Page, Section } from '../types/wiki';
import { createLexicon } from '../utils/lexicon';
import {
  splitParagraphs, trimSections, unmaskPage, unmaskTokens, wordAsLexicalEntry,
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
  pageName: string;
  page: ResponsePage;
  start: string;
  end: string;
  yesterdaysTitle: Token[] | undefined;
}

function lexicalizeToken([word, isHidden]: Token): LexicalizedToken {
  return [word, isHidden, isHidden ? wordAsLexicalEntry(word) : word];
}

function transformSection({
  title, paragraphs, depth, sections,
}: ResponseSection): Section {
  return {
    title: title.map(lexicalizeToken),
    depth,
    paragraphs: splitParagraphs(paragraphs.map(lexicalizeToken)),
    sections: sections.map(transformSection),
  };
}

function transformPage({ title, summary, sections }: ResponsePage): Page {
  return {
    title: title.map(lexicalizeToken),
    summary: splitParagraphs(summary.map(lexicalizeToken)),
    sections: sections.map(transformSection),
  };
}

export function getPage() {
  return fetch('api/page')
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
        pageName: data.pageName,
        language: data.language,
        start: new Date(data.start),
        end: new Date(data.end),
        yesterdaysTitle: data.yesterdaysTitle === undefined ? undefined : unmaskTokens(
          data.yesterdaysTitle.map(lexicalizeToken),
          freeWords,
          false,
        ),
      };
    });
}
