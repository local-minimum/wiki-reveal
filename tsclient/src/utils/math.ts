export const avg = (arr: number[]): number => arr.reduce((acc, v) => acc + v) / arr.length;

export const within = (
  ref: number,
  value: number,
  fraction: number,
): boolean => value > ref * (1 - fraction) && value < ref * (1 + fraction);

export const smaller = (
  ref: number | undefined,
  value: number | undefined,
  fraction: number,
): boolean => {
  if (ref === undefined || value === undefined) return false;
  return value < ref * fraction;
};

export const larger = (
  ref: number | undefined,
  value: number | undefined,
  fraction: number,
): boolean => {
  if (ref === undefined || value === undefined) return false;
  return value > ref * fraction;
};
