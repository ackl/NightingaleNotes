export function throttle<T extends (...args: any[]) => any>(
  mainFunction: T,
  delay: number,
): T {
  let timerFlag: number | null = null;

  return ((...args: Parameters<T>) => {
    if (timerFlag === null) {
      try {
        const result = mainFunction(...args);
        timerFlag = setTimeout(() => {
          timerFlag = null;
        }, delay);
        return result;
      } catch (error) {
        timerFlag = setTimeout(() => {
          timerFlag = null;
        }, delay);
        throw error;
      }
    }
    return undefined;
  }) as T;
}
