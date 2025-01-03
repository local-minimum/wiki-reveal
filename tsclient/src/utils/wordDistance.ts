export const wordDistance = (a: string | null, b: string): number => {
  if (a == null) return b.length;

  const an = a.length;
  const bn = b.length;

  if (an === 0) {
    return bn;
  }

  if (bn === 0) {
    return an;
  }

  const matrix = new Array<number[]>(bn + 1);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= bn; ++i) {
    const row = matrix[i] ?? new Array<number>(an + 1);
    row[0] = i;
    matrix[i] = row;
  }

  const firstRow = matrix[0];

  // eslint-disable-next-line no-plusplus
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= bn; ++i) {
    // eslint-disable-next-line no-plusplus
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1], // substitution
          matrix[i][j - 1], // insertion
          matrix[i - 1][j], // deletion
        ) + 1;
      }
    }
  }

  return matrix[bn][an];
};
