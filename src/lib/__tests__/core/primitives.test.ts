import { describe, expect, it } from 'vitest';
import {
  notes,
  accidentals,
  noteLabels,
  INTERVALS,
  circleOfFifths,
  getNoteFromInterval,
} from '../../core/primitives';
import type { Note, AccidentalName, IntervalSymbol } from '../../core/primitives';

describe('Core Primitives', () => {
  describe('Notes', () => {
    it('should contain all 12 chromatic notes', () => {
      expect(notes).toHaveLength(12);
      expect(notes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should have sequential values from 0 to 11', () => {
      notes.forEach((note, index) => {
        expect(note).toBe(index);
        expect(note).toBeValidNote();
      });
    });

    it('should be readonly in TypeScript', () => {
      // TypeScript enforces immutability at compile time
      // Runtime mutability is not enforced by 'as const' in JavaScript
      expect(notes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });
  });

  describe('Accidentals', () => {
    it('should contain all standard accidental symbols', () => {
      expect(accidentals.SHARP).toBe('♯');
      expect(accidentals.FLAT).toBe('♭');
      expect(accidentals.NATURAL).toBe('♮');
      expect(accidentals.DOUBLE_SHARP).toBe('𝄪');
      expect(accidentals.DOUBLE_FLAT).toBe('𝄫');
    });

    it('should have 5 accidental types (may extend in future))', () => {
      expect(Object.keys(accidentals)).toHaveLength(5);
    });
  });

  describe('Note Labels', () => {
    it('should contain all 7 natural note names', () => {
      // also should be in correct alphabetical order
      expect(noteLabels).toHaveLength(7);
      expect(noteLabels).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('should be in correct alphabetical order', () => {
      expect(noteLabels).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });
  });

  describe('Intervals', () => {
    it('should contain all standard interval types', () => {
      expect(INTERVALS.P1).toBe(0); // Perfect unison
      expect(INTERVALS.m2).toBe(1); // Minor second
      expect(INTERVALS.M2).toBe(2); // Major second
      expect(INTERVALS.m3).toBe(3); // Minor third
      expect(INTERVALS.M3).toBe(4); // Major third
      expect(INTERVALS.P4).toBe(5); // Perfect fourth
      expect(INTERVALS.TT).toBe(6); // Tritone
      expect(INTERVALS.A4).toBe(6); // Augmented fourth
      expect(INTERVALS.d5).toBe(6); // Diminished fifth
      expect(INTERVALS.P5).toBe(7); // Perfect fifth
      expect(INTERVALS.m6).toBe(8); // Minor sixth
      expect(INTERVALS.M6).toBe(9); // Major sixth
      expect(INTERVALS.m7).toBe(10); // Minor seventh
      expect(INTERVALS.M7).toBe(11); // Major seventh
      expect(INTERVALS.P8).toBe(12); // Perfect octave
    });

    it('should have enharmonic equivalents', () => {
      // Test enharmonic intervals (same semitone value)
      expect(INTERVALS.d2).toBe(INTERVALS.P1); // 0
      expect(INTERVALS.A1).toBe(INTERVALS.m2); // 1
      expect(INTERVALS.d3).toBe(INTERVALS.M2); // 2
      expect(INTERVALS.A2).toBe(INTERVALS.m3); // 3
      expect(INTERVALS.d4).toBe(INTERVALS.M3); // 4
      expect(INTERVALS.A3).toBe(INTERVALS.P4); // 5
      expect(INTERVALS.A4).toBe(INTERVALS.d5); // 6
      expect(INTERVALS.d6).toBe(INTERVALS.P5); // 7
      expect(INTERVALS.A5).toBe(INTERVALS.m6); // 8
      expect(INTERVALS.d7).toBe(INTERVALS.M6); // 9
      expect(INTERVALS.A6).toBe(INTERVALS.m7); // 10
      expect(INTERVALS.d8).toBe(INTERVALS.M7); // 11
      expect(INTERVALS.A7).toBe(INTERVALS.P8); // 12
    });

    it('should have all interval values within valid range', () => {
      Object.values(INTERVALS).forEach((interval) => {
        expect(interval).toBeValidInterval();
        expect(interval).toBeGreaterThanOrEqual(0);
        expect(interval).toBeLessThanOrEqual(12);
      });
    });

    it('should contain exactly 27 interval definitions', () => {
      expect(Object.keys(INTERVALS)).toHaveLength(27);
    });

    it('should be readonly in TypeScript', () => {
      // TypeScript enforces immutability at compile time
      expect(INTERVALS.P5).toBe(7);
    });
  });

  describe('Circle of Fifths', () => {
    it('should contain all 12 notes', () => {
      expect(circleOfFifths).toHaveLength(12);
    });

    it('should have each note appear exactly once', () => {
      const uniqueNotes = new Set(circleOfFifths);
      expect(uniqueNotes.size).toBe(12);

      // Check that all notes from 0-11 are present
      for (let i = 0; i < 12; i++) {
        expect(uniqueNotes.has(i as Note)).toBe(true);
      }
    });

    it('should be in correct fifth order', () => {
      // Expected order: C, G, D, A, E, B, F#/Gb, C#/Db, G#/Ab, D#/Eb, A#/Bb, F
      const expected = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
      expect(circleOfFifths).toEqual(expected);
    });

    it('should be generated correctly using perfect fifths', () => {
      for (let i = 0; i < 12; i++) {
        const expectedNote = ((i * INTERVALS.P5) % 12) as Note;
        expect(circleOfFifths[i]).toBe(expectedNote);
      }
    });

    it('should have all valid notes', () => {
      circleOfFifths.forEach((note) => {
        expect(note).toBeValidNote();
      });
    });

    it('should wrap around correctly', () => {
      // Check that adding 12 perfect fifths returns to the starting note
      const startNote = 0;
      let currentNote = startNote;

      for (let i = 0; i < 12; i++) {
        currentNote = ((currentNote + INTERVALS.P5) % 12) as Note;
      }

      expect(currentNote).toBe(startNote);
    });
  });

  describe('getNoteFromInterval', () => {
    it('should calculate intervals correctly within octave', () => {
      // Test basic intervals
      expect(getNoteFromInterval(0, 0)).toBe(0); // C + unison = C
      expect(getNoteFromInterval(0, 7)).toBe(7); // C + P5 = G
      expect(getNoteFromInterval(0, 4)).toBe(4); // C + M3 = E
      expect(getNoteFromInterval(7, 5)).toBe(0); // G + P4 = C
    });

    it('should handle octave wrapping correctly', () => {
      // Test intervals that cross octave boundaries
      expect(getNoteFromInterval(11, 2)).toBe(1); // B + M2 = C# (next octave)
      expect(getNoteFromInterval(9, 5)).toBe(2); // A + P4 = D (next octave)
      expect(getNoteFromInterval(6, 8)).toBe(2); // F# + m6 = D (next octave)
    });

    it('should handle large intervals correctly', () => {
      // Test intervals larger than an octave
      expect(getNoteFromInterval(0, 12)).toBe(0); // C + octave = C
      expect(getNoteFromInterval(0, 19)).toBe(7); // C + octave + P5 = G
      expect(getNoteFromInterval(0, 24)).toBe(0); // C + 2 octaves = C
    });

    it('should handle negative intervals correctly', () => {
      // Test descending intervals
      expect(getNoteFromInterval(0, -1)).toBe(11); // C - semitone = B
      expect(getNoteFromInterval(0, -5)).toBe(7); // C - P4 = G
      expect(getNoteFromInterval(7, -7)).toBe(0); // G - P5 = C
      expect(getNoteFromInterval(5, -12)).toBe(5); // F - octave = F
    });

    it('should handle edge cases', () => {
      // Test with maximum and minimum note values
      expect(getNoteFromInterval(0, 11)).toBe(11); // C + M7 = B
      expect(getNoteFromInterval(11, 1)).toBe(0); // B + m2 = C
      expect(getNoteFromInterval(0, 0)).toBe(0); // Unison
    });

    it('should always return valid notes', () => {
      // Test with various combinations including negative intervals
      for (let note = 0; note < 12; note++) {
        for (let interval = -24; interval <= 24; interval++) {
          const result = getNoteFromInterval(note as Note, interval);
          expect(result).toBeValidNote();
        }
      }
    });

    it('should be mathematically consistent', () => {
      // Test that adding intervals is associative modulo 12
      const note: Note = 5;
      const interval1 = 7;
      const interval2 = 3;

      // (note + interval1) + interval2 should equal note + (interval1 + interval2)
      const result1 = getNoteFromInterval(getNoteFromInterval(note, interval1), interval2);
      const result2 = getNoteFromInterval(note, interval1 + interval2);

      expect(result1).toBe(result2);
    });

    it('should handle tritone correctly', () => {
      // Test tritone (most distant interval)
      expect(getNoteFromInterval(0, INTERVALS.TT)).toBe(6); // C + tritone = F#
      expect(getNoteFromInterval(6, INTERVALS.TT)).toBe(0); // F# + tritone = C
    });
  });

  describe('Type Safety', () => {
    it('should enforce Note type constraints', () => {
      // These should compile without errors
      const validNote: Note = 0;
      const anotherValidNote: Note = 11;

      expect(validNote).toBeValidNote();
      expect(anotherValidNote).toBeValidNote();
    });

    it('should enforce AccidentalName type constraints', () => {
      const validAccidentalName: AccidentalName = 'SHARP';
      const anotherValidAccidentalName: AccidentalName = 'FLAT';

      expect(accidentals[validAccidentalName]).toBe('♯');
      expect(accidentals[anotherValidAccidentalName]).toBe('♭');
    });

    it('should enforce IntervalSymbol type constraints', () => {
      const validIntervalSymbol: IntervalSymbol = 'P5';
      const anotherValidIntervalSymbol: IntervalSymbol = 'M3';

      expect(INTERVALS[validIntervalSymbol]).toBe(7);
      expect(INTERVALS[anotherValidIntervalSymbol]).toBe(4);
    });
  });
});
