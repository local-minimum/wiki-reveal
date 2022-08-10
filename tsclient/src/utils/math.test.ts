import { avg, larger, smaller, within } from './math';

describe('avg()', () => {
  it.each([
    [[2, 2], 2],
    [[1, 4, 1, 0], 1.5],
  ])('Calculates the average for %o', (arr, average) => {
    expect(avg(arr)).toBeCloseTo(average);
  });
});

describe('within()', () => {
  it.each([
    [3, 4, 50, true],
    [2, 4, 50, false],
    [3, 4, 25, false],
    [3, 4, 26, true],
    [5, 4, 26, true],
    [5, 4, 25, false],
  ])('checks if %i is within %i +- %i%%', (value, ref, percent, expected) => {
    expect(within(ref, value, percent / 100)).toBe(expected);
  });
});

describe('smaller()', () => {
  it.each([
    [undefined, undefined, 0.5, false],
    [1, undefined, 0.5, false],
    [undefined, 1, 0.5, false],
    [1, 1, 0.5, false],
    [1, 2, 0.5, false],
    [1, 2, 0.51, true],
    [20, 2, 0.51, false],
  ])('checks if %o is smaller', (value, ref, fraction, expected) => {
    expect(smaller(ref, value, fraction)).toBe(expected);
  });
});

describe('larger()', () => {
  it.each([
    [undefined, undefined, 1.5, false],
    [1, undefined, 1.5, false],
    [undefined, 1, 1.5, false],
    [1, 1, 1.5, false],
    [3, 2, 1.5, false],
    [2, 2, 0.5, true],
    [3, 2, 1.49, true],
    [1, 2, 1.51, false],
  ])('checks if %o is larger', (value, ref, fraction, expected) => {
    expect(larger(ref, value, fraction)).toBe(expected);
  });
});
