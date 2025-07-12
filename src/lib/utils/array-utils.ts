export function wrapArray<T>(arr: Array<T>, startIndex: number): Array<T> {
  startIndex = (startIndex % arr.length + arr.length) % arr.length;

  const part1 = arr.slice(startIndex);
  const part2 = arr.slice(0, startIndex);

  const wrappedArray = part1.concat(part2);

  return wrappedArray;
}