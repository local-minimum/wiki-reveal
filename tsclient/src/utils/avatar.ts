const COLOR_CACHE: Record<string, string> = {};

export function stringToColor(name: string): string {
  if (COLOR_CACHE[name] !== undefined) return COLOR_CACHE[name];

  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  COLOR_CACHE[name] = color;
  return color;
}

const NAME_CACHE: Record<string, string> = {};

export function initials(name: string): string {
  if (NAME_CACHE[name] !== undefined) return NAME_CACHE[name];
  const inits = name.split(' ').map((v) => v[0].toUpperCase()).join('');
  NAME_CACHE[name] = inits;
  return inits;
}
