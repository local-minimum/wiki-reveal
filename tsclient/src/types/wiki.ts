export type LexicalizedToken = [
  token: string | null,
  isHidden: boolean,
  lexicalEntry: string | null,
];

export interface Section {
  title: LexicalizedToken[];
  depth: number;
  paragraphs: Array<LexicalizedToken[]>;
  sections: Section[];
}

export interface Page {
  title: LexicalizedToken[];
  summary: Array<LexicalizedToken[]>;
  sections: Section[];
}
