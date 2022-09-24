export interface AboutData {
    name: string;
    pages: string;
}

export function getAbout(): Promise<AboutData> {
  return fetch('/api/about')
    .then((result) => {
      if (result.ok) return result.json();
      throw new Error('Failed to get about');
    });
}
