/**
 * @fileoverview Key signature calculation and generation system.
 *
 * This module handles the complex mathematics and logic behind generating key signatures
 * for any tonic and tonality combination. It implements the circle of fifths algorithm,
 * accidental determination, and proper enharmonic spelling according to music theory rules.
 *
 * Key signature calculation involves:
 * - Circle of fifths positioning
 * - Sharp vs flat determination based on key relationships
 * - Proper enharmonic spelling (F# vs Gb)
 * - Scale degree labeling with correct accidentals
 */

import {
  Note, Sequence, AccidentalName, circleOfFifths,
  NoteLabel,
} from '../core/primitives';
import { TONALITY, NaturalNote, buildScale } from '../core/scales';
import { getScaleLabels } from './labeling';
import { memoize } from '../utils/memoize';

/**
 * The order in which sharps appear in key signatures.
 * Based on the circle of fifths, each new sharp key adds the next sharp in this sequence.
 *
 * Mnemonic: "Father Charles Goes Down And Ends Battle"
 * Order: F# - C# - G# - D# - A# - E# - B#
 *
 * @example
 * ```typescript
 * // G Major (1 sharp): F#
 * SHARP_ORDER.slice(0, 1) // [5] = F#
 *
 * // E Major (4 sharps): F#, C#, G#, D#
 * SHARP_ORDER.slice(0, 4) // [5, 0, 7, 2] = F#, C#, G#, D#
 * ```
 */
export const SHARP_ORDER: NaturalNote[] = [5, 0, 7, 2, 9, 4, 11];

/**
 * The order in which flats appear in key signatures.
 * Based on the circle of fifths in reverse, each new flat key adds the next flat in this sequence.
 *
 * Mnemonic: "Battle Ends And Down Goes Charles's Father"
 * Order: Bb - Eb - Ab - Db - Gb - Cb - Fb
 *
 * @example
 * ```typescript
 * // F Major (1 flat): Bb
 * FLAT_ORDER.slice(0, 1) // [11] = Bb
 *
 * // Ab Major (4 flats): Bb, Eb, Ab, Db
 * FLAT_ORDER.slice(0, 4) // [11, 4, 9, 2] = Bb, Eb, Ab, Db
 * ```
 */
export const FLAT_ORDER: NaturalNote[] = [11, 4, 9, 2, 7, 0, 5]; // B, E, A, D, G, C, F

/**
 * Range of circle of fifths positions that typically use sharp key signatures.
 * Positions 1-4 correspond to G, D, A, E major (and their relative minors).
 */
const SHARP_KEY_RANGE = { min: 1, max: 4 };

/**
 * Range of circle of fifths positions that typically use flat key signatures.
 * Positions 8-11 correspond to F, Bb, Eb, Ab major (and their relative minors).
 */
const FLAT_KEY_RANGE = { min: 8, max: 11 };

/**
 * Total number of positions in the circle of fifths (one for each chromatic note).
 */
const CIRCLE_OF_FIFTHS_LENGTH = circleOfFifths.length;

/**
 * Type representing accidental types allowed in key signatures.
 * Excludes double sharps and double flats as they don't appear in standard key signatures.
 */
type KeySignatureAccidentalType = Exclude<AccidentalName,
  'DOUBLE_FLAT' | 'DOUBLE_SHARP'
>;

/**
 * Interface representing a complete key signature with all its properties.
 *
 * A key signature defines:
 * - Which sharps or flats are active
 * - How notes should be spelled/labeled
 * - The resulting scale with proper enharmonic spelling
 *
 * @example
 * ```typescript
 * // D Major key signature
 * {
 *   tonic: 2,           // D
 *   tonality: TONALITY.MAJOR,
 *   accidentals: [5, 0], // F#, C#
 *   accidentalType: "SHARP",
 *   scaleAscending: {
 *     notes: [2, 4, 6, 7, 9, 11, 1],
 *     labels: ["D", "E", "F♯", "G", "A", "B", "C♯"]
 *   }
 * }
 * ```
 */
export interface KeySignature {
  /** The root note of the key (0-11) */
  tonic: Note;
  /** The label for the key's tonic */
  tonicLabel: NoteLabel;
  /** The scale type (Major, Minor Natural, etc.) */
  tonality: TONALITY;
  /** Array of notes that have accidentals in this key signature */
  accidentals: NaturalNote[];
  /** Whether this key signature uses sharps, flats, or naturals */
  accidentalType: KeySignatureAccidentalType;
  /** The ascending scale with proper note labels */
  scaleAscending: Sequence;
}

/**
 * Determines whether a key should use sharps or flats based on its circle of fifths position.
 *
 * Music theory rules:
 * - Keys close to C major (positions 1-4) typically use sharps
 * - Keys opposite C major (positions 8-11) typically use flats
 * - Enharmonic keys (positions 5-7) can use either, both are returned
 *
 * @param circleOfFifthsIndex - Position in the circle of fifths (0-11)
 * @returns Array of preferred accidental types for this position
 *
 * @example
 * ```typescript
 * determineAccidentalTypes(1)  // ["SHARP"] for G major
 * determineAccidentalTypes(11) // ["FLAT"] for F major
 * determineAccidentalTypes(6)  // ["FLAT", "SHARP"] for F#/Gb major (enharmonic)
 * ```
 */
function determineAccidentalTypes(
  circleOfFifthsIndex: number,
): KeySignatureAccidentalType[] {
  if (!circleOfFifthsIndex) {
    return ['NATURAL'];
  }
  if (
    circleOfFifthsIndex >= SHARP_KEY_RANGE.min
    && circleOfFifthsIndex <= SHARP_KEY_RANGE.max
  ) {
    return ['SHARP'];
  }
  if (
    circleOfFifthsIndex >= FLAT_KEY_RANGE.min
    && circleOfFifthsIndex <= FLAT_KEY_RANGE.max
  ) {
    return ['FLAT'];
  }
  return ['FLAT', 'SHARP'];
}

/**
 * Calculates which specific accidentals appear in a key signature.
 *
 * Uses the standard order of sharps/flats based on circle of fifths mathematics.
 * The number of accidentals is determined by the distance from C major.
 *
 * @param accidentalType - Whether to use sharps or flats
 * @param circleOfFifthsIndex - Position in circle of fifths
 * @returns Array of note numbers that have accidentals
 *
 * @example
 * ```typescript
 * // A major (3 sharps): F#, C#, G#
 * calculateAccidentalsList("SHARP", 3) // [5, 0, 7]
 *
 * // Eb major (3 flats): Bb, Eb, Ab
 * calculateAccidentalsList("FLAT", 9) // [11, 4, 9]
 * ```
 */
function calculateAccidentalsList(
  accidentalType: KeySignatureAccidentalType,
  circleOfFifthsIndex: number,
): NaturalNote[] {
  if (accidentalType === 'FLAT') {
    return FLAT_ORDER.slice(0, CIRCLE_OF_FIFTHS_LENGTH - circleOfFifthsIndex);
  }

  if (accidentalType === 'SHARP') {
    return SHARP_ORDER.slice(0, circleOfFifthsIndex);
  }

  return [];
}

/**
 * Sorts key signatures by preference according to music theory conventions.
 *
 * Sorting criteria:
 * 1. Fewer accidentals preferred (simpler keys first)
 * 2. For enharmonic equivalents, flats preferred over sharps
 *    (Gb major preferred over F# major)
 *
 * @param keySignatures - Array of key signature objects to sort
 * @returns Sorted array with preferred spellings first
 *
 * @example
 * ```typescript
 * // Input: [F# major (6 sharps), Gb major (6 flats)]
 * // Output: [Gb major, F# major] (flat spelling preferred)
 * ```
 */
function sortKeySignatures(keySignatures: KeySignature[]): KeySignature[] {
  return keySignatures.sort((a, b) => {
    const predicate = a.accidentals.length - b.accidentals.length;
    if (predicate) return predicate;
    return a.accidentalType === 'FLAT' ? -1 : 0;
  });
}

/**
 * This is the core key signature calculation logic. It handles:
 * - Circle of fifths positioning
 * - Relative major/minor relationships
 * - Enharmonic equivalent generation
 * - Proper accidental determination
 * - Scale labeling with correct spelling
 *
 * The algorithm:
 * 1. Convert minor keys to their relative major for circle of fifths lookup
 * 2. Determine if key uses sharps, flats, or both (enharmonic)
 * 3. Calculate which accidentals appear in the key signature
 * 4. Generate proper note labels using music theory spelling rules
 * 5. Sort results by preference (simpler keys first, flats over sharps)
 *
 * @param tonic - The root note of the desired key (0-11)
 * @param tonality - The scale type (Major, Minor Natural, etc.)
 * @returns Array of key signature objects, sorted by preference
 *
 * @throws {Error} When the adjusted tonic is not found in circle of fifths
 *
 * @example
 * ```typescript
 * // C Major - no accidentals (cached after first call)
 * getKeySignatures(0, TONALITY.MAJOR)
 * // Returns: [{ tonic: 0, accidentals: [], accidentalType: "NATURAL", ... }]
 *
 * // F# Major - enharmonic key, returns both spellings
 * getKeySignatures(6, TONALITY.MAJOR)
 * // Returns: [
 * //   { tonic: 6, accidentalType: "FLAT", accidentals: [11,4,9,2,7,0] },  // Gb major
 * //   { tonic: 6, accidentalType: "SHARP", accidentals: [5,0,7,2,9,4] }   // F# major
 * // ]
 *
 * // A Minor - relative to C Major
 * getKeySignatures(9, TONALITY.MINOR_NATURAL)
 * // Returns: [{ tonic: 9, accidentals: [], accidentalType: "NATURAL", ... }]
 */
function getKeySignaturesInternal(
  tonic: Note,
  tonality: TONALITY,
): KeySignature[] {
  // Convert minor keys to their relative major for circle of fifths lookup
  let adjustedTonic = tonic;
  if (tonality !== TONALITY.MAJOR) {
    adjustedTonic = ((tonic + 3) % 12) as Note;
  }

  const index = circleOfFifths.indexOf(adjustedTonic);
  if (index === -1) {
    throw new Error(
      `Tonic ${adjustedTonic} not found in circle of fifths.`,
    );
  }

  const keySignatures: KeySignature[] = [];
  const scaleNotes = buildScale(tonic, tonality);

  // Determine whether this key uses sharps, flats, or both
  const accidentalTypes = determineAccidentalTypes(index);

  // Generate key signature(s) for each accidental type
  for (const type of accidentalTypes) {
    const accidentalsList = calculateAccidentalsList(type, index);
    const labels = getScaleLabels(scaleNotes, tonic, type, tonality);

    keySignatures.push({
      tonic,
      tonicLabel: labels[0],
      tonality,
      accidentals: accidentalsList,
      accidentalType: type,
      scaleAscending: {
        notes: scaleNotes,
        labels,
      },
    });
  }

  return sortKeySignatures(keySignatures);
}

/**
 * Generates all possible key signatures for a given tonic and tonality (memoized).
 *
 * This is the main entry point for key signature calculation. Results are cached
 * to improve performance when the same key signature is requested multiple times.
 * This is particularly useful in UI contexts where key signatures are frequently
 * recalculated for the same tonic/tonality combinations.
 * ```
 */
export const getKeySignatures = memoize(getKeySignaturesInternal);

/**
 * Retrieves the preferred label for a major key based on its tonic note.
 *
 * Uses the key signature calculator to determine the preferred enharmonic spelling
 * that follows music theory conventions (e.g., "Db" major rather than "C#" major).
 * The calculator automatically handles the preference for flats over sharps in major keys.
 *
 * @param note - The tonic note number (0-11)
 * @returns String label for the major key
 *
 * @example
 * ```typescript
 * getMajorKeyLabel(0)   // "C"
 * getMajorKeyLabel(1)   // "D♭"
 * getMajorKeyLabel(6)   // "G♭" (preferred over F#)
 * ```
 */
export function getMajorKeyLabel(note: Note): NoteLabel {
  const keySignatures = getKeySignatures(note, TONALITY.MAJOR);
  return keySignatures[0].scaleAscending.labels[0];
}

/**
 * Retrieves the preferred label for a minor key based on its tonic note.
 *
 * Uses the key signature calculator to determine the preferred enharmonic spelling
 * that follows music theory conventions (e.g., "f#" minor rather than "gb" minor).
 * The calculator automatically handles the preference for sharps over flats in minor keys.
 *
 * @param note - The tonic note number (0-11)
 * @returns String label for the minor key
 *
 * @example
 * ```typescript
 * getMinorKeyLabel(9)   // "A"
 * getMinorKeyLabel(6)   // "F♯" (preferred over Gb)
 * getMinorKeyLabel(10)  // "B♭"
 * ```
 */
export function getMinorKeyLabel(note: Note): NoteLabel {
  const keySignatures = getKeySignatures(note, TONALITY.MINOR_NATURAL);
  return keySignatures[0].scaleAscending.labels[0];
}
