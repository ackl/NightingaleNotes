/**
 * @fileoverview Note labeling and enharmonic spelling utilities.
 *
 * This module handles the complex task of converting numeric note values (0-11) into
 * proper musical notation with correct enharmonic spelling. It implements music theory
 * rules for consistent letter name usage, accidental placement, and context-sensitive
 * notation choices.
 *
 * Key challenges addressed:
 * - Enharmonic equivalents (F# vs Gb, depending on musical context)
 * - Consistent alphabetical letter progression (no skipped letters)
 * - Scale-specific accidental rules (natural signs in minor keys)
 * - Cross-octave interval calculations with proper modular arithmetic
 */

import {
  Note,
  AccidentalName,
  AccidentalSymbol,
  NoteLabelBase,
  noteLabels,
  accidentals,
  NoteLabel,
  calculateDifference,
} from '../core/primitives';
import { TONALITY, naturalNotes, tonalityIntervals } from '../core/scales';
import { wrapArray } from '../utils/array-utils';
import { getKeySignatures } from './calculator';

/**
 * Generates the alphabetical sequence of note letters starting from a given tonic.
 *
 * Music theory requires that scales use consecutive letter names (A-B-C-D-E-F-G)
 * without skipping any letters. This function ensures proper letter progression
 * regardless of the starting note.
 *
 * @param tonicBase - The starting note letter (C, D, E, F, G, A, or B)
 * @returns Array of note letters in alphabetical order starting from tonic
 *
 * @example
 * ```typescript
 * getBaseLetters("F")  // ["F", "G", "A", "B", "C", "D", "E"]
 * getBaseLetters("A")  // ["A", "B", "C", "D", "E", "F", "G"]
 * getBaseLetters("C")  // ["C", "D", "E", "F", "G", "A", "B"]
 * ```
 */
export function getBaseLetters(tonicBase: NoteLabelBase): NoteLabelBase[] {
  const startIndex = noteLabels.indexOf(tonicBase);
  return wrapArray([...noteLabels], startIndex);
}

/**
 * Converts a note letter to its corresponding "white key" note number.
 *
 * Maps the seven natural note letters to their piano white key positions:
 * C=0, D=2, E=4, F=5, G=7, A=9, B=11
 *
 * @param noteLabel - A natural note letter (C, D, E, F, G, A, or B)
 * @returns The note number (0-11) for the white key
 *
 * @example
 * ```typescript
 * labelToNote("C")  // 0
 * labelToNote("F")  // 5
 * labelToNote("A")  // 9
 * ```
 */
export function labelToNote(noteLabel: NoteLabelBase): Note {
  const idx = noteLabels.indexOf(noteLabel);
  return naturalNotes[idx];
}

/**
 * Type representing accidental types allowed in key signatures.
 * Excludes double sharps and double flats as they don't appear in standard key signatures.
 */
export type KeySignatureAccidentalType = Exclude<
  AccidentalName,
  'DOUBLE_FLAT' | 'DOUBLE_SHARP'
>;

/**
 * Finds the appropriate base letter and accidental for a given note within a specific key context.
 *
 * This function implements the complex logic for enharmonic spelling based on key signature:
 * - In sharp keys: prefer sharp spellings (F# over Gb)
 * - In flat keys: prefer flat spellings (Gb over F#)
 * - Always find a base letter that works with the specified accidental type
 *
 * The algorithm searches through all possible base letters to find one that, when combined
 * with the appropriate accidental, produces the target note.
 *
 * @param note - The target note number (0-11) to spell
 * @param accidentalType - The preferred accidental type for this key context
 * @returns Object containing the base letter and accidental symbol
 *
 * @throws {Error} When no valid spelling can be found for the note
 *
 * @example
 * ```typescript
 * // In a sharp key context (e.g., G major)
 * findBaseLetterAndAccidental(6, "SHARP")  // { base: "F", accidental: "♯" }
 *
 * // In a flat key context (e.g., Db major)
 * findBaseLetterAndAccidental(6, "FLAT")   // { base: "G", accidental: "♭" }
 *
 * // Natural notes work in any context
 * findBaseLetterAndAccidental(0, "SHARP")  // { base: "B", accidental: "♯" }
 *
 * // Natural notes work in any context
 * findBaseLetterAndAccidental(0, "NATURAL")  // { base: "C", accidental: "" }
 * ```
 */
export function findBaseLetterAndAccidental(
  note: Note,
  accidentalType: KeySignatureAccidentalType,
): { base: NoteLabelBase; accidental: AccidentalSymbol | '' } {
  // Try flat spelling: find a base letter that flattened gives our target note
  if (accidentalType === 'FLAT') {
    for (const base of noteLabels) {
      const notePredicate = labelToNote(base);
      if ((notePredicate - 1 + 12) % 12 === note) {
        return { base, accidental: accidentals.FLAT };
      }
    }
  }

  // Try sharp spelling: find a base letter that sharpened gives our target note
  if (accidentalType === 'SHARP') {
    for (const base of noteLabels) {
      const notePredicate = labelToNote(base);
      if ((notePredicate + 1) % 12 === note) {
        return { base, accidental: accidentals.SHARP };
      }
    }
  }

  // Try natural spelling: find a base letter that matches exactly
  for (const base of noteLabels) {
    const notePredicate = labelToNote(base);
    if (notePredicate === note) {
      return { base, accidental: '' };
    }
  }

  throw new Error(`Cannot find base letter for note ${note}`);
}

/**
 * Determines the appropriate accidental symbol for a note based on context and scale type.
 *
 * This function implements complex music theory rules for when to show accidentals:
 * - In major keys: only show accidentals for non-natural notes
 * - In minor keys: show natural signs when scale differs from natural minor
 * - Handle all accidental types: sharp, flat, natural, double sharp, double flat
 *
 * The function considers the specific tonality because different minor scales
 * (natural, harmonic, melodic) have different accidental requirements.
 *
 * @param difference - Semitone difference from natural note (-2 to +2)
 * @param tonality - The scale type (affects natural sign placement)
 * @param idx - Scale degree index (used for minor key natural sign logic)
 * @returns The appropriate accidental symbol or empty string
 *
 * @throws {Error} When an unsupported difference value is encountered
 *
 * @example
 * ```typescript
 * // Major key: only show accidentals for altered notes
 * getAccidentalSymbol(0, TONALITY.MAJOR, 0)     // "" (no accidental needed)
 * getAccidentalSymbol(1, TONALITY.MAJOR, 0)     // "♯" (sharp needed)
 *
 * // Harmonic minor: natural sign on raised 7th degree
 * getAccidentalSymbol(0, TONALITY.MINOR_HARMONIC, 6)  // "♮" (natural sign)
 *
 * // Various accidental types
 * getAccidentalSymbol(-1, TONALITY.MAJOR, 0)    // "♭" (flat)
 * getAccidentalSymbol(2, TONALITY.MAJOR, 0)     // "𝄪" (double sharp)
 * getAccidentalSymbol(-2, TONALITY.MAJOR, 0)    // "𝄫" (double flat)
 * ```
 */
export function getAccidentalSymbol(
  difference: number,
  tonality: TONALITY,
  idx: number,
): AccidentalSymbol | '' {
  // No difference from natural note
  if (difference === 0) {
    // Major keys: no accidental needed for natural notes
    if (tonality === TONALITY.MAJOR) {
      return '';
    }

    // Minor keys: show natural sign if this degree differs from natural minor
    // This handles cases like the raised 7th in harmonic minor
    if (
      tonalityIntervals[tonality][idx]
      !== tonalityIntervals[TONALITY.MINOR_NATURAL][idx]
    ) {
      return accidentals.NATURAL;
    }

    return '';
  }

  // Map semitone differences to accidental symbols
  if (difference === 1) return accidentals.SHARP;
  if (difference === -1) return accidentals.FLAT;
  if (difference === 2) return accidentals.DOUBLE_SHARP;
  if (difference === -2) return accidentals.DOUBLE_FLAT;

  throw new Error(`Unsupported accidental difference: ${difference}`);
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
 * getScaleLabels([6, 8, 10, 11, 1, 3, 5], 6, "SHARP", TONALITY.MAJOR)
 * // Returns: ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"]
 * ```
 */
export function getScaleLabels(
  scaleNotes: Note[],
  tonic: Note,
  accidentalType: KeySignatureAccidentalType,
  tonality: TONALITY,
): NoteLabel[] {
  const tonicInfo = findBaseLetterAndAccidental(tonic, accidentalType);
  const baseLetters = getBaseLetters(tonicInfo.base);

  return scaleNotes.map((note, i) => {
    const baseLetter = baseLetters[i];
    const naturalNote = labelToNote(baseLetter);
    const difference = calculateDifference(note, naturalNote);
    const accidental = getAccidentalSymbol(difference, tonality, i);
    return `${baseLetter}${accidental}` as NoteLabel;
  });
}

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

/**
 * Generates labels for all 12 chromatic notes based on a key signature's accidental type.
 *
 * This function creates a complete chromatic scale with proper enharmonic spelling
 * consistent with the given key signature. Notes are labeled according to the
 * accidental preference of the key (sharps, flats, or naturals).
 *
 * For natural notes (white keys), the natural name is always used (C, D, E, F, G, A, B).
 * For chromatic notes (black keys):
 * - In sharp keys: uses sharp notation (C♯, D♯, F♯, G♯, A♯)
 * - In flat keys: uses flat notation (D♭, E♭, G♭, A♭, B♭)
 * - In natural keys (C major): defaults to sharp notation
 *
 * @param accidentalType - The accidental type from the key signature
 * @returns Array of 12 note labels representing the complete chromatic scale (C through B)
 *
 * @example
 * ```typescript
 * // In a sharp key (G major):
 * getChromaticNoteLabels("SHARP")
 * // ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
 *
 * // In a flat key (F major):
 * getChromaticNoteLabels("FLAT")
 * // ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
 *
 * // In C major (no accidentals):
 * getChromaticNoteLabels("NATURAL")
 * // ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
 * ```
 */
export function getChromaticNoteLabels(
  accidentalType: KeySignatureAccidentalType,
): NoteLabel[] {
  // Map of note numbers to their labels for sharp and flat contexts
  // Natural notes (0,2,4,5,7,9,11) always use natural names
  // Chromatic notes (1,3,6,8,10) vary by context
  const sharpLabels: NoteLabel[] = [
    'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B',
  ];

  const flatLabels: NoteLabel[] = [
    'C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B',
  ];

  // Natural key context (C major) uses sharp notation for chromatic notes
  if (accidentalType === 'NATURAL' || accidentalType === 'SHARP') {
    return sharpLabels;
  }

  return flatLabels;
}
