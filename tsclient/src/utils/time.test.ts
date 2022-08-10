import { deltaMinutes } from './time';

describe('deltaMinutes()', () => {
  it.each([
    [undefined, undefined, NaN],
    [new Date(), undefined, NaN],
    [undefined, new Date(), NaN],
    [new Date('2022-04-05T12:15:22.000Z'), new Date('2022-04-05T12:19:22.000Z'), 4],
    [new Date('2022-04-05T12:15:22.000Z'), new Date('2022-04-05T13:19:22.000Z'), 64],
  ])('returns expected minutes', (from, to, duration) => {
    expect(deltaMinutes(from, to)).toBe(duration);
  });
});
