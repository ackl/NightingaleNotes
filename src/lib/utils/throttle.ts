export function throttle<T extends (...args: unknown[]) => unknown>(
  mainFunction: T,
  delay: number,
): T {
  let timerFlag: number | null = null;

  return ((...args: Parameters<T>) => {
    if (timerFlag === null) {
      mainFunction(...args);
      timerFlag = setTimeout(() => {
        timerFlag = null;
      }, delay);
    }
  }) as T;
}