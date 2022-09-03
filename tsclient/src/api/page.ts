import { allowedWords } from '../data/allowedWords';
import { LexicalizedToken, Page, Section } from '../types/wiki';
import { createLexicon } from '../utils/lexicon';
import {
  splitParagraphs, trimSections, unmaskPage, unmaskTokens, wordAsLexicalEntry,
} from '../utils/wiki';

type Token = [token: string | null, isHidden: boolean];

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
  yesterdaysPage: string | undefined;
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

export type GameMode = 'today' | 'yesterday' | 'coop';

function gameModeToPath(gameMode: GameMode, room: null | string): string {
  if (gameMode === 'today') return 'api/page';
  if (gameMode === 'yesterday') return 'api/yesterday';
  if (gameMode === 'coop') {
    if (room === null) throw new Error('No room given for coop game');
    return `api/coop/${room}`;
  }
  throw new Error('Game mode not implemented');
}

export function getPage(gameMode: GameMode, room: string | null) {
  return fetch(gameModeToPath(gameMode, room))
    .then(((result): Promise<ResponseJSON> => {
      if (result.ok) return result.json();
      throw new Error('Failed to download page');
    }))
    .then((data) => {
      const page = transformPage(data.page);
      page.sections = trimSections(page.sections);
      const lexicon = createLexicon(page);
      const freeWords = allowedWords[data.language] ?? [];
      const freeWordsLookup: Record<string, true> = Object
        .fromEntries(freeWords.map((lex) => [lex, true]));
      return {
        page: unmaskPage(page, freeWordsLookup),
        lexicon,
        freeWords,
        gameId: data.gameId,
        pageName: data.pageName,
        language: data.language,
        start: new Date(data.start),
        end: new Date(data.end),
        yesterdaysTitle: data.yesterdaysTitle === undefined ? undefined : unmaskTokens(
          data.yesterdaysTitle.map(lexicalizeToken),
          freeWordsLookup,
        ),
        yesterdaysPage: data.yesterdaysPage,
      };
    });
}
