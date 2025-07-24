/**
 * @fileoverview Simple memoization utility for function result caching.
 *
 * Provides a lightweight memoization implementation that caches function results
 * based on serialized arguments. Useful for expensive computations that are
 * called repeatedly with the same parameters.
 */

/**
 * Creates a memoized version of a function that caches results based on arguments.
 *
 * The memoization uses JSON.stringify to create cache keys from arguments,
 * so it works well with primitive types and simple objects but may not be
 * suitable for complex objects with circular references.
 *
 * @param fn - The function to memoize
 * @returns A memoized version of the function with the same signature
 *
 * @example
 * ```typescript
 * // Memoize an expensive calculation
 * const expensiveFunction = (a: number, b: number) => {
 *   return a * b + Math.random();
 * };
 *
 * const memoizedFunction = memoize(expensiveFunction);
 *
 * // First call computes and caches
 * const result1 = memoizedFunction(5, 10);
 *
 * // Second call with same arguments returns cached result
 * const result2 = memoizedFunction(5, 10);
 * // result1 === result2 (no "Computing..." log on second call)
 * ```
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs): TReturn => {
    // Create a cache key from the stringified arguments
    const key = JSON.stringify(args);

    // Return cached result if available
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Compute result, cache it, and return
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
