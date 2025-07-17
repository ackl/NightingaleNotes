import {
  describe, expect, it, vi, beforeEach, afterEach,
} from 'vitest';
import { throttle } from '../../utils/throttle';

describe('Throttle Utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should call the function immediately on first invocation', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();

      expect(mockFn).toHaveBeenCalledOnce();
    });

    it('should not call the function again during throttle period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledOnce();
    });

    it('should allow function to be called again after delay', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should respect the specified delay', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 500);

      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      // Should not call again before delay
      vi.advanceTimersByTime(499);
      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      // Should call again after delay
      vi.advanceTimersByTime(1);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Argument Handling', () => {
    it('should pass arguments correctly to the original function', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1', 'arg2', 42);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 42);
    });

    it('should handle functions with no arguments', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();

      expect(mockFn).toHaveBeenCalledWith();
    });

    it('should handle functions with multiple argument types', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      const obj = { test: true };
      const arr = [1, 2, 3];

      throttledFn(obj, arr, 'string', 123, true, null, undefined);

      expect(mockFn).toHaveBeenCalledWith(obj, arr, 'string', 123, true, null, undefined);
    });

    it('should handle rest parameters', () => {
      const mockFn = vi.fn((...args: number[]) => args.reduce((a, b) => a + b, 0));
      const throttledFn = throttle(mockFn, 100);

      throttledFn(1, 2, 3, 4, 5);

      expect(mockFn).toHaveBeenCalledWith(1, 2, 3, 4, 5);
    });
  });

  describe('Return Value Handling', () => {
    it('should return the result of the original function', () => {
      const mockFn = vi.fn(() => 'test result');
      const throttledFn = throttle(mockFn, 100);

      const result = throttledFn();

      expect(result).toBe('test result');
    });

    it('should handle functions that return different types', () => {
      const numberFn = vi.fn(() => 42);
      const stringFn = vi.fn(() => 'hello');
      const objectFn = vi.fn(() => ({ test: true }));
      const arrayFn = vi.fn(() => [1, 2, 3]);
      const booleanFn = vi.fn(() => true);
      const nullFn = vi.fn(() => null);
      const undefinedFn = vi.fn(() => undefined);

      const throttledNumber = throttle(numberFn, 100);
      const throttledString = throttle(stringFn, 100);
      const throttledObject = throttle(objectFn, 100);
      const throttledArray = throttle(arrayFn, 100);
      const throttledBoolean = throttle(booleanFn, 100);
      const throttledNull = throttle(nullFn, 100);
      const throttledUndefined = throttle(undefinedFn, 100);

      expect(throttledNumber()).toBe(42);
      expect(throttledString()).toBe('hello');
      expect(throttledObject()).toEqual({ test: true });
      expect(throttledArray()).toEqual([1, 2, 3]);
      expect(throttledBoolean()).toBe(true);
      expect(throttledNull()).toBe(null);
      expect(throttledUndefined()).toBe(undefined);
    });

    it('should not return anything during throttle period', () => {
      const mockFn = vi.fn(() => 'result');
      const throttledFn = throttle(mockFn, 100);

      const firstCall = throttledFn();
      const secondCall = throttledFn();

      expect(firstCall).toBe('result');
      expect(secondCall).toBe(undefined);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero delay', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 0);

      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      // Should be able to call again immediately after zero delay
      vi.advanceTimersByTime(0);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle negative delay', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, -100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      // Should treat negative delay as zero
      vi.advanceTimersByTime(0);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle very large delays', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 1000000);

      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(999999);
      throttledFn();
      expect(mockFn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(1);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle function that throws errors', () => {
      const mockFn = vi.fn(() => {
        throw new Error('Test error');
      });
      const throttledFn = throttle(mockFn, 100);

      expect(() => throttledFn()).toThrow('Test error');
      expect(mockFn).toHaveBeenCalledOnce();

      // Should still respect throttling even after error (no call, so no error)
      const result = throttledFn();
      expect(result).toBe(undefined);
      expect(mockFn).toHaveBeenCalledOnce();
    });
  });

  describe('Multiple Instance Isolation', () => {
    it('should maintain separate throttle states for different instances', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const throttledFn1 = throttle(mockFn1, 100);
      const throttledFn2 = throttle(mockFn2, 100);

      throttledFn1();
      throttledFn2();

      expect(mockFn1).toHaveBeenCalledOnce();
      expect(mockFn2).toHaveBeenCalledOnce();

      throttledFn1();
      throttledFn2();

      expect(mockFn1).toHaveBeenCalledOnce();
      expect(mockFn2).toHaveBeenCalledOnce();
    });

    it('should allow different delays for different instances', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const throttledFn1 = throttle(mockFn1, 100);
      const throttledFn2 = throttle(mockFn2, 200);

      throttledFn1();
      throttledFn2();

      expect(mockFn1).toHaveBeenCalledOnce();
      expect(mockFn2).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      throttledFn1();
      throttledFn2();

      expect(mockFn1).toHaveBeenCalledTimes(2);
      expect(mockFn2).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      throttledFn1();
      throttledFn2();

      expect(mockFn1).toHaveBeenCalledTimes(3);
      expect(mockFn2).toHaveBeenCalledTimes(2);
    });
  });

  describe('Context and Binding', () => {
    it('should preserve function context', () => {
      const context = {
        value: 42,
        // eslint-disable-next-line
        method: vi.fn(function (this: { value: number }) {
          return this.value;
        }),
      };

      const throttledMethod = throttle(context.method.bind(context), 100);
      const result = throttledMethod();

      expect(result).toBe(42);
      expect(context.method).toHaveBeenCalledOnce();
    });

    it('should work with arrow functions', () => {
      const value = 42;
      const arrowFn = vi.fn(() => value);
      const throttledArrowFn = throttle(arrowFn, 100);

      const result = throttledArrowFn();

      expect(result).toBe(42);
      expect(arrowFn).toHaveBeenCalledOnce();
    });
  });

  describe('Performance and Memory', () => {
    it('should not accumulate timers when called multiple times', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times during throttle period
      for (let i = 0; i < 10; i++) {
        throttledFn();
      }

      expect(mockFn).toHaveBeenCalledOnce();

      // Should only have one timer
      expect(vi.getTimerCount()).toBe(1);
    });

    it('should clean up timers properly', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(vi.getTimerCount()).toBe(1);

      vi.advanceTimersByTime(100);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work for scroll event handlers', () => {
      // Simulate scroll handling
      const scrollHandler = vi.fn((event: Event) => event.type);
      const throttledScrollHandler = throttle(scrollHandler, 16); // ~60fps

      const mockEvent = { type: 'scroll' } as Event;

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        throttledScrollHandler(mockEvent);
      }

      expect(scrollHandler).toHaveBeenCalledOnce();
      expect(scrollHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('should work for resize event handlers', () => {
      const resizeHandler = vi.fn((width: number, height: number) => ({ width, height }));
      const throttledResizeHandler = throttle(resizeHandler, 100);

      const result = throttledResizeHandler(800, 600);

      expect(result).toEqual({ width: 800, height: 600 });
      expect(resizeHandler).toHaveBeenCalledWith(800, 600);

      // Rapid resize events should be throttled
      throttledResizeHandler(810, 610);
      throttledResizeHandler(820, 620);

      expect(resizeHandler).toHaveBeenCalledOnce();
    });

    it('should work for API call throttling', () => {
      const apiCall = vi.fn(async (query: string) => `Results for: ${query}`);
      const throttledApiCall = throttle(apiCall, 300);

      const result = throttledApiCall('test query');

      expect(result).resolves.toBe('Results for: test query');
      expect(apiCall).toHaveBeenCalledWith('test query');

      // Rapid API calls should be throttled
      throttledApiCall('another query');
      throttledApiCall('third query');

      expect(apiCall).toHaveBeenCalledOnce();
    });

    it('should work for user input handlers', () => {
      const inputHandler = vi.fn((value: string) => value.toUpperCase());
      const throttledInputHandler = throttle(inputHandler, 200);

      const result = throttledInputHandler('hello');

      expect(result).toBe('HELLO');
      expect(inputHandler).toHaveBeenCalledWith('hello');

      // Rapid typing should be throttled
      throttledInputHandler('hello w');
      throttledInputHandler('hello wo');
      throttledInputHandler('hello wor');
      throttledInputHandler('hello worl');
      throttledInputHandler('hello world');

      expect(inputHandler).toHaveBeenCalledOnce();
    });
  });

  describe('Type Safety', () => {
    it('should preserve function signature', () => {
      const typedFn = (a: number, b: string, c: boolean): string => `${a}-${b}-${c}`;
      const throttledTypedFn = throttle(typedFn, 100);

      const result = throttledTypedFn(42, 'test', true);

      expect(result).toBe('42-test-true');
      expect(typeof result).toBe('string');
    });

    it('should handle generic functions', () => {
      const genericFn = <T>(value: T): T => value;
      const throttledGenericFn = throttle(genericFn, 100);

      const numberResult = throttledGenericFn(42);
      expect(numberResult).toBe(42);

      // Allow throttle to reset
      vi.advanceTimersByTime(100);

      const stringResult = throttledGenericFn('hello');
      expect(stringResult).toBe('hello');

      // Allow throttle to reset
      vi.advanceTimersByTime(100);

      const objectResult = throttledGenericFn({ test: true });
      expect(objectResult).toEqual({ test: true });
    });
  });
});
