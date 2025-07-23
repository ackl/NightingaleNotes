/**
 * @fileoverview Core musical primitives and fundamental types for music theory calculations.
 *
 * This module provides the foundational building blocks for all music theory operations,
 * including notes, intervals, accidentals, and basic mathematical relationships.
 */

/**
 * Array of all 12 chromatic notes represented as integers (0-11).
 * Uses chromatic numbering where C=0, C#/Db=1, D=2, etc.
 *
 * @example
 * ```typescript
 * notes[0] // 0 (C)
 * notes[1] // 1 (C#/Db)
 * notes[11] // 11 (B)
 * ```
 */
export const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/**
 * Type representing a musical note as an integer from 0-11.
 * This branded type ensures type safety when working with note values.
 *
 * @example
 * ```typescript
 * const c: Note = 0;
 * const fs: Note = 6;
 * ```
 */
export type Note = (typeof notes)[number];

/**
 * Map of accidental names to their Unicode musical symbols.
 * Provides standard notation symbols for all common accidentals.
 *
 * @example
 * ```typescript
 * accidentals.SHARP    // "♯"
 * accidentals.FLAT     // "♭"
 * accidentals.NATURAL  // "♮"
 * ```
 */
export const accidentals = {
  /** Sharp symbol: ♯ */
  SHARP: '♯',
  /** Flat symbol: ♭ */
  FLAT: '♭',
  /** Natural symbol: ♮ */
  NATURAL: '♮',
  /** Double sharp symbol: 𝄪 */
  DOUBLE_SHARP: '𝄪',
  /** Double flat symbol: 𝄫 */
  DOUBLE_FLAT: '𝄫',
} as const;

/**
 * Union type of all accidental names (keys from accidentals object).
 */
export type AccidentalName = keyof typeof accidentals;

/**
 * Union type of all accidental symbols (values from accidentals object).
 */
export type AccidentalSymbol = (typeof accidentals)[AccidentalName];

/**
 * Array of the seven natural note names in Western music.
 * Ordered according to the musical alphabet: C, D, E, F, G, A, B.
 *
 * @example
 * ```typescript
 * noteLabels[0] // "C"
 * noteLabels[6] // "B"
 * ```
 */
export const noteLabels = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
] as const satisfies string[];

/**
 * Type representing a base note letter (C, D, E, F, G, A, B).
 */
export type NoteLabelBase = (typeof noteLabels)[number];

/**
 * Type representing a complete note label, which can be either:
 * - A base note letter: "C", "D", etc.
 * - A base note letter with an accidental: "C♯", "D♭", etc.
 *
 * @example
 * ```typescript
 * const c: NoteLabel = "C";
 * const cs: NoteLabel = "C♯";
 * const df: NoteLabel = "D♭";
 * ```
 */
export type NoteLabel = NoteLabelBase | `${NoteLabelBase}${AccidentalSymbol}`;

/**
 * Type representing a musical sequence with both numeric and label representations.
 * Used for scales, chords, and other musical collections.
 *
 * @example
 * ```typescript
 * const cMajorScale: Sequence = {
 *   notes: [0, 2, 4, 5, 7, 9, 11],
 *   labels: ["C", "D", "E", "F", "G", "A", "B"]
 * };
 * ```
 */
export interface Sequence {
  /** Array of note values (0-11) */
  notes: Note[];
  /** Array of corresponding note labels */
  labels: NoteLabel[];
}

/**
 * Comprehensive map of musical intervals to their semitone values.
 * Includes all standard interval types: perfect, major, minor, augmented, and diminished.
 *
 * Abbreviations:
 * - P = Perfect
 * - M = Major
 * - m = minor
 * - A = Augmented
 * - d = diminished
 * - TT = Tritone
 *
 * @example
 * ```typescript
 * INTERVALS.P5  // 7 (perfect fifth)
 * INTERVALS.M3  // 4 (major third)
 * INTERVALS.TT  // 6 (tritone)
 * ```
 */
export const INTERVALS = {
  /** Perfect unison */
  P1: 0,
  /** Diminished second (enharmonic with perfect unison) */
  d2: 0,
  /** Minor second */
  m2: 1,
  /** Augmented unison (enharmonic with minor second) */
  A1: 1,
  /** Major second */
  M2: 2,
  /** Diminished third (enharmonic with major second) */
  d3: 2,
  /** Minor third */
  m3: 3,
  /** Augmented second (enharmonic with minor third) */
  A2: 3,
  /** Major third */
  M3: 4,
  /** Diminished fourth (enharmonic with major third) */
  d4: 4,
  /** Perfect fourth */
  P4: 5,
  /** Augmented third (enharmonic with perfect fourth) */
  A3: 5,
  /** Tritone (augmented fourth/diminished fifth) */
  TT: 6,
  /** Augmented fourth */
  A4: 6,
  /** Diminished fifth */
  d5: 6,
  /** Perfect fifth */
  P5: 7,
  /** Diminished sixth (enharmonic with perfect fifth) */
  d6: 7,
  /** Minor sixth */
  m6: 8,
  /** Augmented fifth (enharmonic with minor sixth) */
  A5: 8,
  /** Major sixth */
  M6: 9,
  /** Diminished seventh (enharmonic with major sixth) */
  d7: 9,
  /** Minor seventh */
  m7: 10,
  /** Augmented sixth (enharmonic with minor seventh) */
  A6: 10,
  /** Major seventh */
  M7: 11,
  /** Diminished octave (enharmonic with major seventh) */
  d8: 11,
  /** Perfect octave */
  P8: 12,
  /** Augmented seventh (enharmonic with perfect octave) */
  A7: 12,
} as const;

/**
 * Union type of all interval names (keys from INTERVALS object).
 */
export type IntervalSymbol = keyof typeof INTERVALS;

/**
 * Pre-computed circle of fifths as an array of Note values.
 * Generated by starting at C (0) and adding perfect fifths modulo 12.
 *
 * Order: C, G, D, A, E, B, F#/Gb, C#/Db, G#/Ab, D#/Eb, A#/Bb, F
 *
 * @example
 * ```typescript
 * circleOfFifths[0]  // 0 (C)
 * circleOfFifths[1]  // 7 (G)
 * circleOfFifths[6]  // 6 (F#/Gb)
 * ```
 */
export const circleOfFifths: Note[] = Array.from(
  { length: 12 },
  (_, i) => ((i * INTERVALS.P5) % 12) as Note,
);

/**
 * Calculates the note that results from adding an interval to a base note.
 * i.e. Transposes a note
 * Uses modulo 12 arithmetic to handle octave wrapping.
 *
 * @param lower - The starting note (0-11)
 * @param interval - The interval to add (in semitones)
 * @returns The resulting note after adding the interval
 *
 * @example
 * ```typescript
 * getNoteFromInterval(0, 7)  // 7 (C + perfect fifth = G)
 * getNoteFromInterval(11, 2) // 1 (B + major second = C# in next octave)
 * ```
 */
export function getNoteFromInterval(lower: Note, interval: number): Note {
  let newNote = ((lower + interval) % 12);
  if (interval < 0) {
    newNote = (newNote + 12) % 12;
  }
  return newNote as Note;
}

/**
 * Calculates the interval between two notes (in semitones).
 * Returns the shortest interval from note1 to note2 within one octave.
 *
 * @param note1 - The starting note (0-11)
 * @param note2 - The ending note (0-11)
 * @returns The interval in semitones (0-11)
 *
 * @example
 * ```typescript
 * calculateInterval(0, 7)  // 7 (C to G = perfect fifth)
 * calculateInterval(7, 0)  // 5 (G to C = perfect fourth)
 * calculateInterval(11, 0) // 1 (B to C = minor second)
 * ```
 */
export function calculateInterval(note1: Note, note2: Note): number {
  return ((note2 - note1 + 12) % 12);
}

export function generateSequenceNotes(sequence: Sequence) {
  const max = Math.max(...sequence.notes);
  const maxIdx = sequence.notes.indexOf(max as Note);

  // rearrange so that whole array of notes is only
  // ascending numbers without the modulo 12
  // this is so that the audioContext sample can use this value
  // to determine how to detune the A440 sample
  const lower = sequence.notes.slice(0, maxIdx + 1);

  // const upper = sequence.notes.slice(maxIdx + 1).map((x) => x + 12);
  const upper = sequence.notes.slice(maxIdx + 1).map((x) => x + 12);

  // since we build notes of a heptatonic add back the octave
  const sequenceNotes = [...lower, ...upper, lower[0] + 12];
  return sequenceNotes;
}

export function buildWholeSequence(sequence: Sequence, octaves: number) {
  let sequenceNotes = generateSequenceNotes(sequence);
  const originalLength = sequenceNotes.length;
  for (let i = 2; i < octaves; i++) {
    const nextOctave: number[] = [];
    for (let j = 0; j < originalLength; j++) {
      const noteValue = sequenceNotes[j] + 12 * (i - 1);
      if (Number.isNaN(noteValue)) {
        throw Error('You fucked up dawg');
      }
      nextOctave.push(noteValue);
    }
    sequenceNotes = Array.from(new Set([...sequenceNotes, ...nextOctave]));
  }

  return sequenceNotes;
}
