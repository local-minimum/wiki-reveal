export function relIndexed<T, >(arr: T[], idx: number, fallback?: T): T
export function relIndexed<T, >(
  arr: T[],
  idx: number,
  fallback?: T,
): T | undefined {
  return (idx < 0 ? arr[arr.length - idx] : arr[idx]) ?? fallback;
}
