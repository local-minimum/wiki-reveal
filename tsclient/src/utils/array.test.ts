import { relIndexed } from './array';

describe('relIndexed()', () => {
  const arr = [1, 2, 3, 4, 5];

  it.each([
    [0, 1],
    [3, 4],
    [8, undefined],
    [-1, 5],
    [-3, 3],
    [-5, 1],
    [-6, undefined],
  ])('returns the relative index %i', (index, expected) => {
    expect(relIndexed(arr, index)).toBe(expected);
  });

  it('returns fallback value if outside array', () => {
    expect(relIndexed(arr, 10, -1)).toBe(-1);
  });
});
