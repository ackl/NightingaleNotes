export function wrapArray<T>(arr: T[], startIndex: number): T[] {
  const idx = ((startIndex % arr.length) + arr.length) % arr.length;

  const part1 = arr.slice(idx);
  const part2 = arr.slice(0, idx);

  const wrappedArray = part1.concat(part2);

  return wrappedArray;
}
