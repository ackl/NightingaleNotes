/**
 * @fileoverview Test helpers and utilities for music theory testing.
 *
 * This module provides reusable helper functions, mock data, and utilities
 * to simplify writing tests for music theory functionality. It includes
 * common test patterns, data generators, and assertion helpers.
 */

import type { Note } from '../../core/primitives';
import { calculateInterval } from '../../core/primitives';
import type { CHORD_TYPE } from '../../core/chords';

/**
 * Assertion helper for testing chord qualities.
 * Useful for validating chord construction results.
 */
export function assertChordQuality(
  chord: Note[],
  expectedQuality: CHORD_TYPE,
): void {
  if (chord.length !== 3) {
    throw new Error(`Expected triad (3 notes), got ${chord.length} notes`);
  }

  const [root, third, fifth] = chord;
  const thirdInterval = calculateInterval(root, third);
  const fifthInterval = calculateInterval(root, fifth);

  const qualities: Record<CHORD_TYPE, { third: number; fifth: number }> = {
    M: { third: 4, fifth: 7 }, // Major
    m: { third: 3, fifth: 7 }, // Minor
    d: { third: 3, fifth: 6 }, // Diminished
    '+': { third: 4, fifth: 8 }, // Augmented
    maj7: { third: 4, fifth: 7 }, // Major 7th (just checking triad part)
    7: { third: 4, fifth: 7 }, // Dominant 7th (just checking triad part)
    m7: { third: 3, fifth: 7 }, // Minor 7th (just checking triad part)
    dm7: { third: 3, fifth: 6 }, // Half-diminished 7th (just checking triad part)
    d7: { third: 3, fifth: 6 }, // Fully diminished 7th (just checking triad part)
  };

  const expected = qualities[expectedQuality];
  if (!expected) {
    throw new Error(`Unsupported chord quality: ${expectedQuality}`);
  }

  if (thirdInterval !== expected.third || fifthInterval !== expected.fifth) {
    throw new Error(
      `Expected ${expectedQuality} chord with intervals ${expected.third}-${expected.fifth}, `
      + `got ${thirdInterval}-${fifthInterval}`,
    );
  }
}
