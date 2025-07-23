/**
 * @fileoverview Musical scale definitions and tonality types.
 *
 * This module defines the core scale structures, tonalities, and interval patterns
 * used throughout the music theory library for scale analysis and generation.
 */

import { Note } from './primitives';

/**
 * Enumeration of supported musical tonalities (scale types).
 *
 * Each tonality represents a different pattern of intervals that creates
 * distinct harmonic and melodic characteristics.
 *
 * @example
 * ```typescript
 * const majorKey = TONALITY.MAJOR;
 * const harmonicMinor = TONALITY.MINOR_HARMONIC;
 * ```
 */
export enum TONALITY {
  /** Major scale (Ionian mode) - bright, happy character */
  MAJOR = 'Major',
  /** Natural minor scale (Aeolian mode) - dark, sad character */
  MINOR_NATURAL = 'Minor Natural',
  /** Harmonic minor scale - exotic sound with raised 7th degree */
  MINOR_HARMONIC = 'Minor Harmonic',
  /** Melodic minor scale (ascending/jazz form) - smooth melodic motion */
  MINOR_MELODIC = 'Minor Melodic (ascending/jazz)',
}

/**
 * The interval pattern for white keys on a piano, representing the major scale.
 * These correspond to the natural notes: C, D, E, F, G, A, B.
 *
 * Interval pattern from tonic: W-W-H-W-W-W-H (where W=whole step, H=half step).
 *
 * @example
 * ```typescript
 * // C major scale intervals
 * whiteKeys // [0, 2, 4, 5, 7, 9, 11] = C, D, E, F, G, A, B
 * ```
 */
export const naturalNotes = [0, 2, 4, 5, 7, 9, 11] as const satisfies Note[];
export type NaturalNote = (typeof naturalNotes)[number];

/**
 * Map of each tonality to its characteristic interval pattern.
 * Each array represents the semitone intervals from the tonic note.
 *
 * @example
 * ```typescript
 * // Get the interval pattern for harmonic minor
 * const harmonicMinorPattern = tonalityIntervals[TONALITY.MINOR_HARMONIC];
 * // [0, 2, 3, 5, 7, 8, 11] = W-H-W-W-H-A2-H
 * ```
 */
export const tonalityIntervals: Record<TONALITY, Note[]> = {
  /**
   * Major scale intervals: W-W-H-W-W-W-H
   * Pattern: 1-2-3-4-5-6-7 (all natural degrees)
   */
  [TONALITY.MAJOR]: naturalNotes,

  /**
   * Natural minor scale intervals: W-H-W-W-H-W-W
   * Pattern: 1-2-♭3-4-5-♭6-♭7 (lowered 3rd, 6th, and 7th degrees)
   */
  [TONALITY.MINOR_NATURAL]: [0, 2, 3, 5, 7, 8, 10],

  /**
   * Harmonic minor scale intervals: W-H-W-W-H-A2-H
   * Pattern: 1-2-♭3-4-5-♭6-7 (raised 7th creates augmented 2nd interval)
   */
  [TONALITY.MINOR_HARMONIC]: [0, 2, 3, 5, 7, 8, 11],

  /**
   * Melodic minor scale intervals (ascending/jazz form): W-H-W-W-W-W-H
   * Pattern: 1-2-♭3-4-5-6-7 (raised 6th and 7th for smoother melody)
   */
  [TONALITY.MINOR_MELODIC]: [0, 2, 3, 5, 7, 9, 11],
};

/**
 * Traditional names for the seven degrees of a diatonic scale.
 * Used in classical music theory to describe the function of each scale degree.
 *
 * Note: The 8th degree (octave) is labeled as "Tonic" to complete the pattern,
 * representing the return to the starting note one octave higher.
 *
 * @example
 * ```typescript
 * diatonicDegreeNames[0] // "Tonic" (1st degree)
 * diatonicDegreeNames[4] // "Dominant" (5th degree)
 * diatonicDegreeNames[6] // "Leading tone" (7th degree)
 * ```
 */
export const diatonicDegreeNames = [
  /** 1st degree - the central tone, point of rest */
  'Tonic',
  /** 2nd degree - creates tension moving to mediant or back to tonic */
  'Supertonic',
  /** 3rd degree - determines major/minor quality */
  'Mediant',
  /** 4th degree - creates strong pull back to tonic */
  'Subdominant',
  /** 5th degree - strongest harmonic support after tonic */
  'Dominant',
  /** 6th degree - provides color and emotional depth */
  'Submediant',
  /** 7th degree - creates strong pull to resolve up to tonic */
  'Leading tone',
  /** 8th degree - octave return to tonic */
  'Tonic',
];

export function buildScale(tonic: number, tonality: TONALITY): Note[] {
  const intervals = tonalityIntervals[tonality];
  return intervals.map((interval) => (tonic + interval) % 12 as Note);
}
