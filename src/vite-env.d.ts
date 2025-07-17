/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="vite/client" />
import 'vitest';

// Type declarations for custom matchers

interface CustomMatchers<R = unknown> {
  toBeValidNote: () => R;
  toBeValidInterval: () => R;
  toBeValidChord: () => R;
  toBeValidTriad: () => R;
  toBeValidScale: () => R;
  toBeEnharmonicChord: (expected: unknown) => R;
}

declare module 'vitest' {
  // eslint-disable
  interface Matchers<T = any> extends CustomMatchers<T> { }
}
