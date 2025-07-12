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

import { Note, Sequence, circleOfFifths } from '../core/primitives';
import { TONALITY, tonalityIntervals } from '../core/scales';
import { 
  findBaseLetterAndAccidental, 
  getBaseLetters, 
  labelToNote, 
  calculateDifference, 
  getAccidentalSymbol 
} from './labeling';

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
export const SHARP_ORDER: Note[] = [5, 0, 7, 2, 9, 4, 11]; // F, C, G, D, A, E, B

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
export const FLAT_ORDER: Note[] = [11, 4, 9, 2, 7, 0, 5]; // B, E, A, D, G, C, F

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
const CIRCLE_OF_FIFTHS_LENGTH = 12;

/**
 * Type representing accidental types allowed in key signatures.
 * Excludes double sharps and double flats as they don't appear in standard key signatures.
 */
type KeySignatureAccidentalType = Exclude<
  import('../core/primitives').AccidentalName,
  "DOUBLE_FLAT" | "DOUBLE_SHARP"
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
  /** The scale type (Major, Minor Natural, etc.) */
  tonality: TONALITY;
  /** Array of notes that have accidentals in this key signature */
  accidentals: Note[];
  /** Whether this key signature uses sharps, flats, or naturals */
  accidentalType: KeySignatureAccidentalType;
  /** The complete scale with proper note labels */
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
function determineAccidentalTypes(circleOfFifthsIndex: number): ("SHARP" | "FLAT")[] {
  if (circleOfFifthsIndex >= SHARP_KEY_RANGE.min && circleOfFifthsIndex <= SHARP_KEY_RANGE.max) {
    return ["SHARP"];
  } else if (circleOfFifthsIndex >= FLAT_KEY_RANGE.min && circleOfFifthsIndex <= FLAT_KEY_RANGE.max) {
    return ["FLAT"];
  } else {
    return ["FLAT", "SHARP"];
  }
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
function calculateAccidentalsList(accidentalType: "SHARP" | "FLAT", circleOfFifthsIndex: number): Note[] {
  if (accidentalType === "SHARP") {
    return SHARP_ORDER.slice(0, circleOfFifthsIndex);
  } else {
    const numFlats = CIRCLE_OF_FIFTHS_LENGTH - circleOfFifthsIndex;
    return FLAT_ORDER.slice(0, numFlats);
  }
}

/**
 * Generates proper note labels for a scale considering key signature and tonality.
 * 
 * This function implements complex music theory rules for:
 * - Enharmonic spelling (F# vs Gb)
 * - Scale degree alterations (raised 7th in harmonic minor)
 * - Consistent letter name usage (no skipped letters)
 * - Natural sign placement in minor keys
 * 
 * @param scaleNotes - The numeric notes of the scale (0-11)
 * @param tonic - The root note of the key
 * @param accidentalType - Sharp/flat preference for this key
 * @param tonality - Scale type (affects accidental placement)
 * @returns Array of properly formatted note labels
 * 
 * @example
 * ```typescript
 * // F# major scale notes: [6, 8, 10, 11, 1, 3, 5]
 * calculateScaleLabels([6, 8, 10, 11, 1, 3, 5], 6, "SHARP", TONALITY.MAJOR)
 * // Returns: ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"]
 * ```
 */
function calculateScaleLabels(
  scaleNotes: Note[],
  tonic: Note,
  accidentalType: KeySignatureAccidentalType,
  tonality: TONALITY
): import('../core/primitives').NoteLabel[] {
  const tonicInfo = findBaseLetterAndAccidental(tonic, accidentalType);
  const baseLetters = getBaseLetters(tonicInfo.base);

  return scaleNotes.map((note, i) => {
    const baseLetter = baseLetters[i];
    const naturalNote = labelToNote(baseLetter);
    const difference = calculateDifference(note, naturalNote);
    const accidental = getAccidentalSymbol(difference, tonality, i);
    return `${baseLetter}${accidental}`;
  }) as import('../core/primitives').NoteLabel[];
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
    return a.accidentalType === "FLAT" ? -1 : 0;
  });
}

/**
 * Generates all possible key signatures for a given tonic and tonality.
 * 
 * This is the main entry point for key signature calculation. It handles:
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
 * // C Major - no accidentals
 * getKeySignatures(0, TONALITY.MAJOR)
 * // Returns: [{ tonic: 0, accidentals: [], accidentalType: "NATURAL", ... }]
 * 
 * // F# Major - enharmonic key, returns both spellings
 * getKeySignatures(6, TONALITY.MAJOR)  
 * // Returns: [
 * //   { accidentalType: "FLAT", accidentals: [11,4,9,2,7,0] },  // Gb major
 * //   { accidentalType: "SHARP", accidentals: [5,0,7,2,9,4] }   // F# major
 * // ]
 * 
 * // A Minor - relative to C Major
 * getKeySignatures(9, TONALITY.MINOR_NATURAL)
 * // Returns: [{ tonic: 9, accidentals: [], accidentalType: "NATURAL", ... }]
 * ```
 */
export function getKeySignatures(
  tonic: Note,
  tonality: TONALITY,
): KeySignature[] {
  // Convert minor keys to their relative major for circle of fifths lookup
  let adjustedTonic = tonic;
  if (tonality !== TONALITY.MAJOR) {
    adjustedTonic = (tonic + 3) % 12 as Note;
  }

  const index = circleOfFifths.indexOf(adjustedTonic);
  if (index === -1) {
    throw new Error(
      `Adjusted tonic ${adjustedTonic} not found in circle of fifths.`,
    );
  }

  const keySignatures: KeySignature[] = [];
  const intervals = tonalityIntervals[tonality];
  const scaleNotes = intervals.map((interval) =>
    (tonic + interval) % 12 as Note
  );

  // Special case: C major/A minor (no accidentals)
  if (index === 0) {
    const labels = calculateScaleLabels(scaleNotes, tonic, "NATURAL", tonality);

    keySignatures.push({
      tonic,
      tonality,
      accidentals: [],
      accidentalType: "NATURAL",
      scaleAscending: {
        notes: scaleNotes,
        labels,
      },
    });
    return keySignatures;
  }

  // Determine whether this key uses sharps, flats, or both
  const accidentalTypes = determineAccidentalTypes(index);

  // Generate key signature(s) for each accidental type
  for (const type of accidentalTypes) {
    const accidentalsList = calculateAccidentalsList(type, index);
    const labels = calculateScaleLabels(scaleNotes, tonic, type, tonality);

    keySignatures.push({
      tonic,
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