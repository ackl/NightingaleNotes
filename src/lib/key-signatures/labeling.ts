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

import { Note, AccidentalName, AccidentalSymbol, NoteLabelBase, noteLabels, accidentals } from '../core/primitives';
import { TONALITY, whiteKeys, tonalityIntervals } from '../core/scales';
import { wrapArray } from '../utils/array-utils';

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
  return whiteKeys[idx];
}

/**
 * Type representing accidental types allowed in key signatures.
 * Excludes double sharps and double flats as they don't appear in standard key signatures.
 */
type KeySignatureAccidentalType = Exclude<AccidentalName, "DOUBLE_FLAT" | "DOUBLE_SHARP">;

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
 * findBaseLetterAndAccidental(0, "SHARP")  // { base: "C", accidental: "" }
 * ```
 */
export function findBaseLetterAndAccidental(
  note: Note,
  accidentalType: KeySignatureAccidentalType,
): { base: NoteLabelBase; accidental: AccidentalSymbol | "" } {
  // Try flat spelling: find a base letter that flattened gives our target note
  if (accidentalType === "FLAT") {
    for (const base of noteLabels) {
      const notePredicate = labelToNote(base);
      if ((notePredicate - 1 + 12) % 12 === note) {
        return { base, accidental: accidentals.FLAT };
      }
    }
  }

  // Try sharp spelling: find a base letter that sharpened gives our target note
  if (accidentalType === "SHARP") {
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
      return { base, accidental: "" };
    }
  }

  throw new Error(`Cannot find base letter for note ${note}`);
}

/**
 * Calculates the semitone difference between an actual note and its natural letter position.
 * 
 * This function handles the modular arithmetic needed for cross-octave calculations,
 * ensuring that differences are calculated correctly even when notes wrap around
 * the 12-tone chromatic system.
 * 
 * The difference indicates what accidental is needed:
 * - 0: Natural (no accidental needed)
 * - +1: Sharp needed
 * - -1: Flat needed  
 * - +2: Double sharp needed
 * - -2: Double flat needed
 * 
 * @param actualNote - The target note number (0-11)
 * @param naturalNote - The natural note number for the base letter
 * @returns Semitone difference (-2 to +2)
 * 
 * @example
 * ```typescript
 * // F# (6) vs natural F (5): needs sharp
 * calculateDifference(6, 5)   // +1 (sharp)
 * 
 * // Gb (6) vs natural G (7): needs flat  
 * calculateDifference(6, 7)   // -1 (flat)
 * 
 * // C (0) vs natural C (0): no accidental
 * calculateDifference(0, 0)   // 0 (natural)
 * 
 * // Cross-octave example: B (11) vs C (0) 
 * calculateDifference(11, 0)  // -1 (flat, for Cb)
 * ```
 */
export function calculateDifference(actualNote: Note, naturalNote: Note): number {
  let difference = actualNote - naturalNote;
  
  // Handle cross-octave wrapping: ensure difference is in range [-2, +2]
  if (difference > 2) {
    difference = (difference - 12) % 12;
  } else if (difference < -2) {
    difference = (difference + 12) % 12;
  }

  return difference;
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
): AccidentalSymbol | "" {
  // No difference from natural note
  if (difference === 0) {
    // Major keys: no accidental needed for natural notes
    if (tonality === TONALITY.MAJOR) {
      return "";
    }

    // Minor keys: show natural sign if this degree differs from natural minor
    // This handles cases like the raised 7th in harmonic minor
    if (
      tonalityIntervals[tonality][idx] !==
      tonalityIntervals[TONALITY.MINOR_NATURAL][idx]
    ) {
      return accidentals.NATURAL;
    }

    return "";
  }

  // Map semitone differences to accidental symbols
  if (difference === 1) return accidentals.SHARP;
  if (difference === -1) return accidentals.FLAT;
  if (difference === 2) return accidentals.DOUBLE_SHARP;
  if (difference === -2) return accidentals.DOUBLE_FLAT;
  
  throw new Error(`Unsupported accidental difference: ${difference}`);
}

/**
 * Pre-computed array of major key labels for quick lookup.
 * 
 * Generated by adding flat variants to most notes, excluding C and F which
 * are rarely spelled with flats in major key contexts.
 * 
 * Order corresponds to chromatic note numbers 0-11.
 * Used for displaying key names in major key contexts.
 */
const majorKeyLabels = noteLabels.flatMap((prev, i) => {
  return (i !== 0 && i !== 3) ? [prev + "b", prev] : [prev];
});

/**
 * Pre-computed array of minor key labels for quick lookup.
 * 
 * Generated by adding sharp variants to most notes, with special handling:
 * - E and A rarely use sharps in minor key contexts
 * - B uses flat instead of sharp for minor keys
 * 
 * Order corresponds to chromatic note numbers 0-11.
 * Used for displaying key names in minor key contexts.
 */
const minorKeyLabels = noteLabels.flatMap((prev, i) => {
  if (i === 2 || i === 6) {
    return [prev + "b", prev];
  }
  if (i === 1 || i === 5) return [prev];

  return [prev, prev + "#"];
});

/**
 * Retrieves the standard label for a major key based on its tonic note.
 * 
 * Uses pre-computed lookup table that follows common music theory conventions
 * for major key naming (e.g., "Db" major rather than "C#" major).
 * 
 * @param note - The tonic note number (0-11)
 * @returns String label for the major key
 * 
 * @example
 * ```typescript
 * getMajorKeyLabel(0)   // "C"
 * getMajorKeyLabel(1)   // "Db" 
 * getMajorKeyLabel(6)   // "Gb" (preferred over F#)
 * ```
 */
export function getMajorKeyLabel(note: Note): string {
  return majorKeyLabels[note];
}

/**
 * Retrieves the standard label for a minor key based on its tonic note.
 * 
 * Uses pre-computed lookup table that follows common music theory conventions
 * for minor key naming (e.g., "f#" minor rather than "gb" minor).
 * 
 * @param note - The tonic note number (0-11)
 * @returns String label for the minor key
 * 
 * @example
 * ```typescript
 * getMinorKeyLabel(9)   // "a"
 * getMinorKeyLabel(6)   // "f#" (preferred over gb)
 * getMinorKeyLabel(10)  // "bb" 
 * ```
 */
export function getMinorKeyLabel(note: Note): string {
  return minorKeyLabels[note];
}