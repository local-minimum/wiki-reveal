import { initials, stringToColor } from './avatar';

describe('stringToColor()', () => {
  it('is determinate', () => {
    const name = 'Very common name';

    expect(stringToColor(name)).toBe(stringToColor(name));
  });
});

describe('initials()', () => {
  it.each([
    ['Local Minimum', 'LM'],
    ['Local-Minimum', 'L'],
    ['local minimum', 'LM'],
    ['global almost maximum', 'GAM'],
  ])('Returns the expected initials for "%s"', (name, inits) => {
    expect(initials(name)).toBe(inits);
  });
});
