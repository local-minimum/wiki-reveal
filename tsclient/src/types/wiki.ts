export type LexicalizedToken = [token: string, isHidden: boolean, lexicalEntry: string];

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
