export function pluralize(singular: string, count: number): string {
  if (count === 1) return singular;
  if (singular.match(/(f|fe)$/)) {
    if (['roof', 'chef', 'belief', 'cheif'].includes(singular.toLocaleLowerCase())) {
      return `${singular}s`;
    }
    return singular.replace(/(f|fe)$/, 'ves');
  }
  if (singular.match(/[^eyuioa]y$/)) {
    return singular.replace(/y$/, 'ies');
  }
  if (singular.match(/(s|sh|ch|x|z|o)$/)) {
    if (['photo', 'piano', 'halo'].includes(singular.toLocaleLowerCase())) {
      return `${singular}s`;
    }
    return `${singular}es`;
  }
  return `${singular}s`;
}
