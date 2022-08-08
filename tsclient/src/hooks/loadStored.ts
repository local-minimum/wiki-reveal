export function loadStored<T>(key: string, defaultValue: T | undefined): T | undefined {
  const stored = localStorage.getItem(key);
  if (stored === null) {
    return defaultValue;
  }
  return JSON.parse(stored);
}
