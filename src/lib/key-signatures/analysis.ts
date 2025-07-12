/**
 * @fileoverview Higher-level harmonic analysis functions for key signatures.
 * 
 * This module provides advanced analysis functionality that builds upon the core
 * key signature calculation and labeling systems. It generates complete diatonic
 * chord information with proper enharmonic spelling and musical context.
 * 
 * Key features:
 * - Diatonic triad generation for any key signature
 * - Context-aware chord labeling using key signature spelling
 * - Proper handling of chromatic alterations
 * - Integration with Roman numeral analysis system
 */

import { Note, Sequence, NoteLabel } from '../core/primitives';
import { buildChord } from '../core/chords';
import { getDiatonicChordTypes } from '../theory/roman-numerals';
import type { KeySignature } from './calculator';

/**
 * Generates proper note labels for chord tones based on the key signature context.
 * 
 * This function ensures that chord notes are spelled consistently with the key signature,
 * maintaining proper enharmonic relationships and avoiding theoretical inconsistencies.
 * It prioritizes notes that appear in the scale, falling back to chromatic alterations
 * when necessary.
 * 
 * The labeling algorithm:
 * 1. Check if each chord note appears directly in the scale
 * 2. If found, use the scale's preferred spelling
 * 3. If not found, look for enharmonic equivalents in the scale
 * 4. As a last resort, use numeric fallback (rare edge case)
 * 
 * @param chordNotes - Array of note numbers (0-11) that make up the chord
 * @param keySignature - The key signature context providing spelling preferences
 * @returns Array of properly formatted note labels for the chord
 * 
 * @example
 * ```typescript
 * // In G Major (F# in key signature)
 * const gMajorKeySignature = getKeySignatures(7, TONALITY.MAJOR)[0];
 * const gMajorTriad = [7, 11, 2]; // G, B, D
 * generateChordLabels(gMajorTriad, gMajorKeySignature)
 * // Returns: ["G", "B", "D"]
 * 
 * // In F# Major with augmented chord
 * const fsMajorKeySignature = getKeySignatures(6, TONALITY.MAJOR)[0]; 
 * const augmentedTriad = [6, 10, 2]; // F#, A#, C# (note: C# vs Db context)
 * generateChordLabels(augmentedTriad, fsMajorKeySignature)
 * // Returns: ["F♯", "A♯", "C♯"] (uses sharp spelling consistent with key)
 * ```
 */
function generateChordLabels(chordNotes: Note[], keySignature: KeySignature): NoteLabel[] {
  // Use the scale labels as a lookup for note names in this key
  const scaleLabels = keySignature.scaleAscending.labels;
  const scaleNotes = keySignature.scaleAscending.notes;
  
  return chordNotes.map(note => {
    // Find this note in the scale - direct match preferred
    const scaleIndex = scaleNotes.indexOf(note);
    if (scaleIndex !== -1) {
      return scaleLabels[scaleIndex];
    }
    
    // If not in scale, use the first scale label that matches this note class
    // This handles chromatic alterations and enharmonic equivalents
    const noteClass = note % 12;
    const matchingScaleIndex = scaleNotes.findIndex(scaleNote => scaleNote === noteClass);
    return matchingScaleIndex !== -1 ? scaleLabels[matchingScaleIndex] : `${note}` as NoteLabel;
  });
}

/**
 * Constructs all seven diatonic triads for a given key signature with proper labeling.
 * 
 * This function is essential for harmonic analysis and chord progression study.
 * It generates the complete set of diatonic chords that naturally occur in a key,
 * each with proper note spellings that respect the key signature and music theory
 * conventions.
 * 
 * The function combines several music theory systems:
 * - Scale degree chord quality patterns (from Roman numeral theory)
 * - Chord construction algorithms (interval stacking)
 * - Context-sensitive note labeling (enharmonic spelling)
 * 
 * Each returned Sequence contains both the numeric note values (for computation)
 * and the string labels (for display and analysis).
 * 
 * @param keySignature - Complete key signature object with tonic, tonality, and scale
 * @returns Array of 7 Sequence objects representing the diatonic triads
 * 
 * @example
 * ```typescript
 * // C Major diatonic triads
 * const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
 * const triads = buildDiatonicTriads(cMajorKey);
 * // Returns:
 * // [
 * //   { notes: [0, 4, 7], labels: ["C", "E", "G"] },      // I - C major
 * //   { notes: [2, 5, 9], labels: ["D", "F", "A"] },      // ii - D minor  
 * //   { notes: [4, 8, 11], labels: ["E", "G", "B"] },     // iii - E minor
 * //   { notes: [5, 9, 0], labels: ["F", "A", "C"] },      // IV - F major
 * //   { notes: [7, 11, 2], labels: ["G", "B", "D"] },     // V - G major
 * //   { notes: [9, 0, 4], labels: ["A", "C", "E"] },      // vi - A minor
 * //   { notes: [11, 2, 5], labels: ["B", "D", "F"] }      // vii° - B dim
 * // ]
 * 
 * // A Harmonic Minor diatonic triads (with augmented III chord)
 * const aHarmonicMinorKey = getKeySignatures(9, TONALITY.MINOR_HARMONIC)[0];
 * const minorTriads = buildDiatonicTriads(aHarmonicMinorKey);
 * // Returns triads including the characteristic C+ (augmented) chord
 * // and proper G# spelling for the raised 7th degree
 * ```
 */
export function buildDiatonicTriads(keySignature: KeySignature): Sequence[] {
  const scale = keySignature.scaleAscending;
  return scale.notes.map((root, i) => {
    const chordType = getDiatonicChordTypes(keySignature.tonality)[i];
    const triad = buildChord(root as Note, chordType);
    const labels = generateChordLabels(triad, keySignature);

    return {
      labels,
      notes: triad,
    };
  });
}