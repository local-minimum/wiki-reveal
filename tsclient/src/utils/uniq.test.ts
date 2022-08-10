import uniq from './uniq';

describe('uniq()', () => {
  it.each([
    [['1', '1', '2', '1', '5'], ['1', '2', '5']],
  ])('to return unique values', (arr, expected) => {
    expect(uniq(arr)).toEqual(expected);
  });
});
