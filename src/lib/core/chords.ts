/**
 * @fileoverview Chord construction and chord type definitions.
 *
 * This module provides the core functionality for building chords from root notes
 * and chord types, including all common triads and seventh chords.
 */

import { Note, INTERVALS, getNoteFromInterval } from './primitives';
import { TONALITY } from './scales';
import { wrapArray } from '../utils/array-utils';

/**
 * Enumeration of all supported chord types with their standard abbreviations.
 *
 * Covers the most common chords in Western music theory:
 * - Basic triads (major, minor, diminished, augmented)
 * - Seventh chords (major 7th, dominant 7th, minor 7th, half-diminished, fully diminished)
 *
 * @example
 * ```typescript
 * const majorChord = CHORD_TYPE_ENUM.MAJOR;      // "M"
 * const minorSeventh = CHORD_TYPE_ENUM.SEVENTH_MIN; // "m7"
 * ```
 */
export enum CHORD_TYPE_ENUM {
  /** Major triad - bright, consonant sound (1-3-5) */
  MAJOR = 'M',
  /** Minor triad - darker, sadder sound (1-♭3-5) */
  MINOR = 'm',
  /** Diminished triad - tense, unstable sound (1-♭3-♭5) */
  DIM = 'd',
  /** Augmented triad - dreamy, mysterious sound (1-3-#5) */
  AUG = '+',
  /** Major seventh chord - sophisticated, jazzy sound (1-3-5-7) */
  SEVENTH_MAJ = 'maj7',
  /** Dominant seventh chord - bluesy, resolving sound (1-3-5-♭7) */
  SEVENTH_DOM = '7',
  /** Minor seventh chord - mellow, jazzy sound (1-♭3-5-♭7) */
  SEVENTH_MIN = 'm7',
  /** Half-diminished seventh chord - haunting, unresolved (1-♭3-♭5-♭7) */
  SEVENTH_HALF_DIM = 'dm7',
  /** Fully diminished seventh chord - very tense, symmetrical (1-♭3-♭5-♭♭7) */
  SEVENTH_FULL_DIM = 'd7',
}

/**
 * Type representing a chord type string literal.
 * Ensures only valid chord type abbreviations are used.
 */
export type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

export const majorScaleChordTypes: CHORD_TYPE[] = ['M', 'm', 'm', 'M', 'M', 'm', 'd'];
const minorHarmonicScaleChordTypes: CHORD_TYPE[] = ['m', 'd', '+', 'm', 'M', 'M', 'd'];
const minorMelodicScaleChordTypes: CHORD_TYPE[] = ['m', 'm', '+', 'M', 'M', 'd', 'd'];

export const TONALITY_DIATONIC_CHORD_ORDER: Record<TONALITY, CHORD_TYPE[]> = {
  [TONALITY.MAJOR]: majorScaleChordTypes,
  [TONALITY.MINOR_NATURAL]: wrapArray(majorScaleChordTypes, 5),
  [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleChordTypes,
  [TONALITY.MINOR_MELODIC]: minorMelodicScaleChordTypes,
};

/**
 * Map of chord types to their interval patterns.
 * Each array represents the intervals from the root note that make up the chord.
 *
 * The intervals are expressed in semitones:
 * - 0 = Root (unison)
 * - 4 = Major third
 * - 3 = Minor third
 * - 7 = Perfect fifth
 * - 6 = Diminished fifth (tritone)
 * - 8 = Augmented fifth
 * - 10 = Minor seventh
 * - 11 = Major seventh
 * - 9 = Diminished seventh
 *
 * @example
 * ```typescript
 * // C major chord intervals
 * CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MAJOR]
 * // [0, 4, 7] = Root, Major 3rd, Perfect 5th = C, E, G
 *
 * // G dominant 7th chord intervals
 * CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_DOM]
 * // [0, 4, 7, 10] = Root, Major 3rd, Perfect 5th, Minor 7th = G, B, D, F
 * ```
 */
export const CHORD_TYPE_INTERVALS_MAP = {
  /** Major triad: Root + Major 3rd + Perfect 5th */
  [CHORD_TYPE_ENUM.MAJOR]: [INTERVALS.P1, INTERVALS.M3, INTERVALS.P5],
  /** Minor triad: Root + Minor 3rd + Perfect 5th */
  [CHORD_TYPE_ENUM.MINOR]: [INTERVALS.P1, INTERVALS.m3, INTERVALS.P5],
  /** Diminished triad: Root + Minor 3rd + Diminished 5th */
  [CHORD_TYPE_ENUM.DIM]: [INTERVALS.P1, INTERVALS.m3, INTERVALS.d5],
  /** Augmented triad: Root + Major 3rd + Augmented 5th */
  [CHORD_TYPE_ENUM.AUG]: [INTERVALS.P1, INTERVALS.M3, INTERVALS.A5],
  /** Major 7th chord: Major triad + Major 7th */
  [CHORD_TYPE_ENUM.SEVENTH_MAJ]: [INTERVALS.P1, INTERVALS.M3, INTERVALS.P5, INTERVALS.M7],
  /** Dominant 7th chord: Major triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_DOM]: [INTERVALS.P1, INTERVALS.M3, INTERVALS.P5, INTERVALS.m7],
  /** Minor 7th chord: Minor triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_MIN]: [INTERVALS.P1, INTERVALS.m3, INTERVALS.P5, INTERVALS.m7],
  /** Half-diminished 7th chord: Diminished triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_HALF_DIM]: [
    INTERVALS.P1,
    INTERVALS.m3,
    INTERVALS.d5,
    INTERVALS.m7,
  ],
  /** Fully diminished 7th chord: Diminished triad + Diminished 7th */
  [CHORD_TYPE_ENUM.SEVENTH_FULL_DIM]: [
    INTERVALS.P1,
    INTERVALS.m3,
    INTERVALS.d5,
    INTERVALS.d7,
  ],
};

/**
 * Constructs a chord by combining a root note with a chord type.
 *
 * Takes a root note and applies the interval pattern for the specified chord type
 * to generate all the notes in the chord. Uses modulo 12 arithmetic to handle
 * octave wrapping.
 *
 * @param root - The root note of the chord (0-11)
 * @param chordType - The type of chord to build (from CHORD_TYPE_ENUM)
 * @returns Array of notes that make up the chord
 *
 * @example
 * ```typescript
 * // Build a C major chord
 * buildChord(0, "M")  // [0, 4, 7] = C, E, G
 *
 * // Build a F# minor 7th chord
 * buildChord(6, "m7") // [6, 9, 1, 4] = F#, A, C#, E
 *
 * // Build a Bb diminished chord
 * buildChord(10, "d") // [10, 1, 4] = Bb, Db, E
 * ```
 */
export function buildChord(root: Note, chordType: CHORD_TYPE): Note[] {
  const intervals = CHORD_TYPE_INTERVALS_MAP[chordType];
  return intervals.map((i: Note) => getNoteFromInterval(root, i));
}

/**
 * Transposes an entire chord by a given interval.
 * Each note in the chord is transposed by the same interval amount.
 *
 * @param chord - Array of notes representing the chord
 * @param interval - The interval to transpose by (in semitones)
 * @returns New array of transposed notes
 *
 * @example
 * ```typescript
 * // Transpose C major chord up by a major second
 * transposeChord([0, 4, 7], 2) // [2, 6, 9] = D major (D, F#, A)
 *
 * // Transpose A minor chord down by a minor third
 * transposeChord([9, 0, 4], -3) // [6, 9, 1] = F# minor (F#, A, C#)
 * ```
 */
export function transposeChord(chord: Note[], interval: number): Note[] {
  return chord.map((note) => getNoteFromInterval(note, interval));
}

/**
 * Generates all possible chord inversions for a given chord.
 * An inversion moves the lowest note to the top, creating different voicings.
 *
 * @param chord - Array of notes representing the chord
 * @returns Array of arrays, each representing a different inversion
 *
 * @example
 * ```typescript
 * // Generate inversions for C major chord
 * generateChordInversions([0, 4, 7])
 * // Returns:
 * // [
 * //   [0, 4, 7],  // Root position (C, E, G)
 * //   [4, 7, 0],  // First inversion (E, G, C)
 * //   [7, 0, 4]   // Second inversion (G, C, E)
 * // ]
 * ```
 */
export function generateChordInversions(chord: Note[]): Note[][] {
  const inversions: Note[][] = [];

  for (let i = 0; i < chord.length; i++) {
    const inversion = [...chord.slice(i), ...chord.slice(0, i)];
    inversions.push(inversion);
  }

  return inversions;
}
