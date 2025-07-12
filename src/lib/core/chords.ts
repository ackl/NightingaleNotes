/**
 * @fileoverview Chord construction and chord type definitions.
 * 
 * This module provides the core functionality for building chords from root notes
 * and chord types, including all common triads and seventh chords.
 */

import { Note, INTERVALS, getNoteFromInterval } from './primitives';

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
  MAJOR = "M",
  /** Minor triad - darker, sadder sound (1-♭3-5) */
  MINOR = "m",
  /** Diminished triad - tense, unstable sound (1-♭3-♭5) */
  DIM = "d",
  /** Augmented triad - dreamy, mysterious sound (1-3-#5) */
  AUG = "+",
  /** Major seventh chord - sophisticated, jazzy sound (1-3-5-7) */
  SEVENTH_MAJ = "maj7",
  /** Dominant seventh chord - bluesy, resolving sound (1-3-5-♭7) */
  SEVENTH_DOM = "7",
  /** Minor seventh chord - mellow, jazzy sound (1-♭3-5-♭7) */
  SEVENTH_MIN = "m7",
  /** Half-diminished seventh chord - haunting, unresolved (1-♭3-♭5-♭7) */
  SEVENTH_HALF_DIM = "dm7",
  /** Fully diminished seventh chord - very tense, symmetrical (1-♭3-♭5-♭♭7) */
  SEVENTH_FULL_DIM = "d7",
}

/**
 * Type representing a chord type string literal.
 * Ensures only valid chord type abbreviations are used.
 */
type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

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
  [CHORD_TYPE_ENUM.MAJOR]: [0, INTERVALS.M3, INTERVALS.P5],
  /** Minor triad: Root + Minor 3rd + Perfect 5th */
  [CHORD_TYPE_ENUM.MINOR]: [0, INTERVALS.m3, INTERVALS.P5],
  /** Diminished triad: Root + Minor 3rd + Diminished 5th */
  [CHORD_TYPE_ENUM.DIM]: [0, INTERVALS.m3, INTERVALS.d5],
  /** Augmented triad: Root + Major 3rd + Augmented 5th */
  [CHORD_TYPE_ENUM.AUG]: [0, INTERVALS.M3, INTERVALS.A5],
  /** Major 7th chord: Major triad + Major 7th */
  [CHORD_TYPE_ENUM.SEVENTH_MAJ]: [0, INTERVALS.M3, INTERVALS.P5, INTERVALS.M7],
  /** Dominant 7th chord: Major triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_DOM]: [0, INTERVALS.M3, INTERVALS.P5, INTERVALS.m7],
  /** Minor 7th chord: Minor triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_MIN]: [0, INTERVALS.m3, INTERVALS.P5, INTERVALS.m7],
  /** Half-diminished 7th chord: Diminished triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_HALF_DIM]: [0, INTERVALS.m3, INTERVALS.d5, INTERVALS.m7],
  /** Fully diminished 7th chord: Diminished triad + Diminished 7th */
  [CHORD_TYPE_ENUM.SEVENTH_FULL_DIM]: [0, INTERVALS.m3, INTERVALS.d5, INTERVALS.d7],
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
  return intervals.map((i) => getNoteFromInterval(root, i));
}