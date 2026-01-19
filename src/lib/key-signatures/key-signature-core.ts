import { Note, NoteLabel } from '../core/primitives';
import { TONALITY } from '../core/scales';
import { getKeySignatures } from './calculator';

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
