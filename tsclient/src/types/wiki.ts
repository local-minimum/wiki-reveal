export type Token = [token: string, isHidden: boolean];

export interface Section {
  title: Token[];
  depth: number;
  paragraphs: Array<Token[]>;
  sections: Section[];
}

export interface Page {
  title: Token[];
  summary: Array<Token[]>;
  sections: Section[];
}
