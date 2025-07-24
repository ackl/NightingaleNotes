/**
 * @fileoverview Chord construction and chord type definitions.
 *
 * This module provides the core functionality for building chords from root notes
 * and chord types, including all common triads and seventh chords.
 */

import { Note, INTERVALS, getNoteFromInterval } from './primitives';
import { TONALITY, tonalityIntervals, buildScale } from './scales';
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
  /** Dominant seventh chord - bluesy, resolving) sound (1-3-5-♭7) */
  SEVENTH_DOM = '7',
  /** Minor seventh chord - mellow, jazzy sound (1-♭3-5-♭7) */
  SEVENTH_MIN = 'm7',
  /** Half-diminished seventh chord - haunting, unresolved (1-♭3-♭5-♭7) */
  SEVENTH_HALF_DIM = 'dm7',
  /** Fully diminished seventh chord - very tense, symmetrical (1-♭3-♭5-♭♭7) */
  SEVENTH_FULL_DIM = 'd7',
  /** Augmented major seventh chord - exotic, dreamy sound (1-3-#5-7) */
  SEVENTH_AUG_MAJ = '+maj7',
  /** Augmented dominant seventh chord - tense, exotic sound (1-3-#5-♭7) */
  SEVENTH_AUG_DOM = '+7',
  /** Minor-major seventh chord - bittersweet, sophisticated sound (1-♭3-5-7) */
  SEVENTH_MIN_MAJ = 'mM7',
}

/**
 * Type representing a chord type string literal.
 * Ensures only valid chord type abbreviations are used.
 */
export type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

/**
 * Calculates the diatonic chord qualities for a given scale by analyzing interval patterns.
 *
 * This function determines chord types
 * (major, minor, diminished, augmented, and their 7th variants)
 * by analyzing the intervals that form when stacking thirds
 * within the scale. It examines the 1st, 3rd, 5th,
 * and optionally 7th degrees of each chord
 * to determine its quality, providing a dynamic alternative
 * to hardcoded chord type arrays.
 *
 * The algorithm:
 * 1. For each scale degree, build a chord using the 1st, 3rd, 5th, (and 7th notes if requested)
 * 2. Calculate the intervals between chord tones
 * 3. Determine chord quality based on interval pattern:
 *    Triads:
 *    - Major 3rd + Perfect 5th = Major triad
 *    - Minor 3rd + Perfect 5th = Minor triad
 *    - Minor 3rd + Diminished 5th = Diminished triad
 *    - Major 3rd + Augmented 5th = Augmented triad
 *
 *    Seventh chords (add 7th degree analysis):
 *    - Major triad + Major 7th = Major seventh chord
 *    - Major triad + Minor 7th = Dominant seventh chord
 *    - Minor triad + Minor 7th = Minor seventh chord
 *    - Diminished triad + Minor 7th = Half-diminished seventh chord
 *    - Diminished triad + Diminished 7th = Fully diminished seventh chord
 *    - Augemented triad + Major 7th = Augmented major seventh chord
 *    - Augemented triad + Minor 7th = Augmented dominant seventh chord
 *    - Minor triad + Major 7th = Minor-major seventh chord
 *
 * @param scale - Array of 7 notes representing the scale degrees (0-11)
 * @param includeSeventh - Whether to include 7th chords (default: false for triads only)
 * @returns Array of CHORD_TYPE values for each degree of the scale
 *
 * @example
 * ```typescript
 * // Calculate triad qualities for C major scale
 * const cMajorScale = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
 * calculateDiatonicChordQualities(cMajorScale)
 * // Returns: ['M', 'm', 'm', 'M', 'M', 'm', 'd']
 * //          I   ii  iii IV  V   vi  vii°
 *
 * // Calculate seventh chord qualities for C major scale
 * calculateDiatonicChordQualities(cMajorScale, true)
 * // Returns: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'dm7']
 * //          Imaj7  ii7  iii7 IVmaj7 V7  vi7  viiø7
 *
 * // Calculate chord qualities for A harmonic minor scale
 * const aHarmonicMinor = [9, 11, 0, 2, 4, 5, 8]; // A, B, C, D, E, F, G#
 * calculateDiatonicChordQualities(aHarmonicMinor)
 * // Returns: ['m', 'd', '+', 'm', 'M', 'M', 'd']
 * //          i   ii° III+ iv  V   VI  vii°
 * ```
 */
function calculateDiatonicChordQualities(scale: Note[], includeSeventh = false): CHORD_TYPE[] {
  if (scale.length !== 7) {
    throw new Error('Scale must contain exactly 7 notes');
  }

  return scale.map((_, i) => {
    // Get chord tones: 1st, 3rd, 5th, and optionally 7th degrees from the scale
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const seventh = includeSeventh ? scale[(i + 6) % 7] : null;

    // Calculate intervals in semitones (handling octave wrapping)
    const thirdInterval = (third - root + 12) % 12;
    const fifthInterval = (fifth - root + 12) % 12;
    const seventhInterval = seventh !== null ? (seventh - root + 12) % 12 : null;

    // Create interval signature for chord quality lookup
    const intervalSignature = includeSeventh && seventhInterval !== null
      ? `${thirdInterval}-${fifthInterval}-${seventhInterval}`
      : `${thirdInterval}-${fifthInterval}`;

    // Map interval patterns to chord qualities
    const chordQualityMap: Record<string, CHORD_TYPE> = {
      // Seventh chords
      // Major 7th: Major triad + Major 7th
      [`${INTERVALS.M3}-${INTERVALS.P5}-${INTERVALS.M7}`]: 'maj7',
      // Dominant 7th: Major triad + Minor 7th
      [`${INTERVALS.M3}-${INTERVALS.P5}-${INTERVALS.m7}`]: '7',
      // Minor 7th: Minor triad + Minor 7th
      [`${INTERVALS.m3}-${INTERVALS.P5}-${INTERVALS.m7}`]: 'm7',
      // Minor-major 7th: Minor triad + Major 7th
      [`${INTERVALS.m3}-${INTERVALS.P5}-${INTERVALS.M7}`]: 'mM7',
      // Half-diminished 7th: Diminished triad + Minor 7th
      [`${INTERVALS.m3}-${INTERVALS.d5}-${INTERVALS.m7}`]: 'dm7',
      // Fully diminished 7th: Diminished triad + Diminished 7th
      [`${INTERVALS.m3}-${INTERVALS.d5}-${INTERVALS.d7}`]: 'd7',
      // Augmented major 7th: Augmented triad + Major 7th
      [`${INTERVALS.M3}-${INTERVALS.A5}-${INTERVALS.M7}`]: '+maj7',
      // Augmented dominant 7th: Augmented triad + Minor 7th
      [`${INTERVALS.M3}-${INTERVALS.A5}-${INTERVALS.m7}`]: '+7',
      // Triads only
      // Major chord: Major 3rd + Perfect 5th
      [`${INTERVALS.M3}-${INTERVALS.P5}`]: 'M',
      // Augmented chord: Major 3rd + Augmented 5th
      [`${INTERVALS.M3}-${INTERVALS.A5}`]: '+',
      // Minor chord: Minor 3rd + Perfect 5th
      [`${INTERVALS.m3}-${INTERVALS.P5}`]: 'm',
      // Diminished chord: Minor 3rd + Diminished 5th
      [`${INTERVALS.m3}-${INTERVALS.d5}`]: 'd',
    };

    const chordQuality = chordQualityMap[intervalSignature];

    if (chordQuality) {
      return chordQuality;
    }

    // Fallback for unexpected interval combinations
    const seventhInfo = includeSeventh && seventhInterval !== null
      ? ` and ${seventhInterval} (seventh)`
      : '';
    throw new Error(
      `Unexpected chord intervals:
${thirdInterval} (third) and
${fifthInterval} (fifth)
${seventhInfo} for scale degree ${i + 1}`,
    );
  });
}

// Export for backward compatibility and direct access
/* eslint-disable*/
export const majorScaleChordTypes: CHORD_TYPE[] = getDiatonicChordTypes(TONALITY.MAJOR);
/* eslint-enable */

/**
 * Dynamically generates diatonic chord types for a given tonality.
 *
 * This function calculates chord qualities by analyzing the interval patterns
 * within each scale, providing a single source of truth that automatically
 * adapts if scale definitions change.
 *
 * @param tonality - The scale type to generate chord qualities for
 * @param includeSeventh - Whether to include 7th chords (default: false for triads only)
 * @returns Array of chord types for the seven diatonic degrees
 */
function getDiatonicChordTypes(tonality: TONALITY, includeSeventh = false): CHORD_TYPE[] {
  // For natural minor, we use the relative major pattern shifted to start from the 6th degree
  if (tonality === TONALITY.MINOR_NATURAL) {
    const majorScalePattern = getDiatonicChordTypes(TONALITY.MAJOR, includeSeventh);
    return wrapArray(majorScalePattern, 5);
  }

  // For all other tonalities, build the scale and calculate chord qualities
  // Use C as tonic for calculation (result is the same for any tonic)
  const scale = buildScale(0, tonality);
  return calculateDiatonicChordQualities(scale, includeSeventh);
}

/**
 * Generates diatonic seventh chord types for a given tonality.
 * Convenience function that calls getDiatonicChordTypes with includeSeventh=true.
 *
 * @param tonality - The scale type to generate seventh chord qualities for
 * @returns Array of seventh chord types for the seven diatonic degrees
 *
 * @example
 * ```typescript
 * // Get seventh chords for C major
 * getDiatonicSeventhChordTypes(TONALITY.MAJOR)
 * // Returns: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'dm7']
 * //          Imaj7  ii7  iii7 IVmaj7 V7  vi7  viiø7
 * ```
 */
export function getDiatonicSeventhChordTypes(tonality: TONALITY): CHORD_TYPE[] {
  return getDiatonicChordTypes(tonality, true);
}

export const TONALITY_DIATONIC_CHORD_ORDER: Record<TONALITY, CHORD_TYPE[]> = {
  [TONALITY.MAJOR]: majorScaleChordTypes,
  [TONALITY.MINOR_NATURAL]: getDiatonicChordTypes(TONALITY.MINOR_NATURAL),
  [TONALITY.MINOR_HARMONIC]: getDiatonicChordTypes(TONALITY.MINOR_HARMONIC),
  [TONALITY.MINOR_MELODIC]: getDiatonicChordTypes(TONALITY.MINOR_MELODIC),
};

/**
 * Mapping of tonalities to their diatonic seventh chord qualities.
 * Provides quick access to seventh chord patterns for harmonic analysis.
 */
export const TONALITY_DIATONIC_SEVENTH_CHORD_ORDER: Record<TONALITY, CHORD_TYPE[]> = {
  [TONALITY.MAJOR]: getDiatonicSeventhChordTypes(TONALITY.MAJOR),
  [TONALITY.MINOR_NATURAL]: getDiatonicSeventhChordTypes(TONALITY.MINOR_NATURAL),
  [TONALITY.MINOR_HARMONIC]: getDiatonicSeventhChordTypes(TONALITY.MINOR_HARMONIC),
  [TONALITY.MINOR_MELODIC]: getDiatonicSeventhChordTypes(TONALITY.MINOR_MELODIC),
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
  /** Augmented major 7th chord: Augmented triad + Major 7th */
  [CHORD_TYPE_ENUM.SEVENTH_AUG_MAJ]: [
    INTERVALS.P1,
    INTERVALS.M3,
    INTERVALS.A5,
    INTERVALS.M7,
  ],
  /** Augmented dominant 7th chord: Augmented triad + Minor 7th */
  [CHORD_TYPE_ENUM.SEVENTH_AUG_DOM]: [
    INTERVALS.P1,
    INTERVALS.M3,
    INTERVALS.A5,
    INTERVALS.m7,
  ],
  /** Minor-major 7th chord: Minor triad + Major 7th */
  [CHORD_TYPE_ENUM.SEVENTH_MIN_MAJ]: [
    INTERVALS.P1,
    INTERVALS.m3,
    INTERVALS.P5,
    INTERVALS.M7,
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
