import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Extend expect with custom matchers for music theory
expect.extend({
  toBeValidNote(received: unknown) {
    const pass = typeof received === 'number'
      && Number.isInteger(received)
      && received >= 0
      && received <= 11;
    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be a valid note (0-11)`
        : `expected ${received} to be a valid note (0-11)`),
    };
  },
  toBeValidInterval(received: unknown) {
    const pass = typeof received === 'number' && Number.isInteger(received);
    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be a valid interval (integer)`
        : `expected ${received} to be a valid interval (integer)`),
    };
  },
  toBeValidChord(received: unknown) {
    const pass = Array.isArray(received)
      && received.length > 0
      && received.every((note) => typeof note === 'number'
        && Number.isInteger(note)
        && note >= 0
        && note <= 11);
    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be a valid chord (array of valid notes)`
        : `expected ${received} to be a valid chord (array of valid notes)`),
    };
  },
  toBeValidTriad(received: unknown) {
    const pass = Array.isArray(received)
      && received.length === 3
      && received.every((note) => typeof note === 'number'
        && Number.isInteger(note)
        && note >= 0
        && note <= 11);
    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be a valid triad (array of 3 valid notes)`
        : `expected ${received} to be a valid triad (array of 3 valid notes)`),
    };
  },
  toBeValidScale(received: unknown) {
    const pass = Array.isArray(received)
      && received.length === 7
      && received.every((note) => typeof note === 'number'
        && Number.isInteger(note)
        && note >= 0
        && note <= 11);
    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be a valid scale (array of 7 valid notes)`
        : `expected ${received} to be a valid scale (array of 7 valid notes)`),
    };
  },
  toBeEnharmonicChord(received: unknown, expected: unknown) {
    if (!Array.isArray(received) || !Array.isArray(expected)) {
      return {
        pass: false,
        /* eslint-disable */
        message: () => `expected both arguments to be arrays, got ${typeof received} and ${typeof expected}`,
      };
    }

    if (received.length !== expected.length) {
      return {
        pass: false,
        message: () => `expected chords to have same length, got ${received.length} and ${expected.length}`,
        /* eslint-enable */
      };
    }

    const normalizedReceived = [...received].sort((a, b) => a - b);
    const normalizedExpected = [...expected].sort((a, b) => a - b);
    const pass = normalizedReceived.every((note, index) => note === normalizedExpected[index]);

    return {
      pass,
      message: () => (pass
        ? `expected ${received} not to be enharmonically equivalent to ${expected}`
        : `expected ${received} to be enharmonically equivalent to ${expected}`),
    };
  },
});
