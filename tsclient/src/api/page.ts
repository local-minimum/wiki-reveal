import { allowedWords } from '../data/allowedWords';
import { Page, Section } from '../types/wiki';
import { splitParagraphs, unmaskPage } from '../utils/wiki';

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
  page: ResponsePage;
}

function transformSection({
  title, paragraphs, depth, sections,
}: ResponseSection): Section {
  return {
    title,
    depth,
    paragraphs: splitParagraphs(paragraphs),
    sections: sections.map((section) => transformSection(section)),
  };
}

function transformPage({ title, summary, sections }: ResponsePage): Page {
  return {
    title,
    summary: splitParagraphs(summary),
    sections: sections.map((section) => transformSection(section)),
  };
}

export function getPage() {
  return fetch('/api/page')
    .then(((result): Promise<ResponseJSON> => {
      if (result.ok) return result.json();
      throw new Error('Failed to download page');
    }))
    .then((data) => unmaskPage(transformPage(data.page), allowedWords[data.language] ?? []));
}
