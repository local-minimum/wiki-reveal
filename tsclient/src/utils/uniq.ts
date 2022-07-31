function uniq(values: string[]): string[] {
  return [...Object.keys(Object.fromEntries(values.map((v) => [v, ''])))];
}

export default uniq;
