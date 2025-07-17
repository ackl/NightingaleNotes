import { describe, expect, it } from 'vitest';
import {
  CHORD_TYPE_ENUM,
  CHORD_TYPE_INTERVALS_MAP,
  buildChord,
} from '../../core/chords';
import { INTERVALS, type Note } from '../../core/primitives';

describe('Chords', () => {
  describe('CHORD_TYPE_ENUM', () => {
    it('should contain all standard chord types', () => {
      expect(CHORD_TYPE_ENUM.MAJOR).toBe('M');
      expect(CHORD_TYPE_ENUM.MINOR).toBe('m');
      expect(CHORD_TYPE_ENUM.DIM).toBe('d');
      expect(CHORD_TYPE_ENUM.AUG).toBe('+');
      expect(CHORD_TYPE_ENUM.SEVENTH_MAJ).toBe('maj7');
      expect(CHORD_TYPE_ENUM.SEVENTH_DOM).toBe('7');
      expect(CHORD_TYPE_ENUM.SEVENTH_MIN).toBe('m7');
      expect(CHORD_TYPE_ENUM.SEVENTH_HALF_DIM).toBe('dm7');
      expect(CHORD_TYPE_ENUM.SEVENTH_FULL_DIM).toBe('d7');
    });

    it('should have all unique values', () => {
      const values = Object.values(CHORD_TYPE_ENUM);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('CHORD_TYPE_INTERVALS_MAP', () => {
    it('should contain intervals for all chord types', () => {
      Object.values(CHORD_TYPE_ENUM).forEach((chordType) => {
        expect(CHORD_TYPE_INTERVALS_MAP[chordType]).toBeDefined();
        expect(Array.isArray(CHORD_TYPE_INTERVALS_MAP[chordType])).toBe(true);
      });
    });

    it('should have correct triad intervals', () => {
      // Major triad: Root + Major 3rd + Perfect 5th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MAJOR]).toEqual([
        0, INTERVALS.M3, INTERVALS.P5,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MAJOR]).toEqual([0, 4, 7]);

      // Minor triad: Root + Minor 3rd + Perfect 5th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MINOR]).toEqual([
        0, INTERVALS.m3, INTERVALS.P5,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MINOR]).toEqual([0, 3, 7]);

      // Diminished triad: Root + Minor 3rd + Diminished 5th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.DIM]).toEqual([
        0, INTERVALS.m3, INTERVALS.d5,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.DIM]).toEqual([0, 3, 6]);

      // Augmented triad: Root + Major 3rd + Augmented 5th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.AUG]).toEqual([
        0, INTERVALS.M3, INTERVALS.A5,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.AUG]).toEqual([0, 4, 8]);
    });

    it('should have correct seventh chord intervals', () => {
      // Major 7th: Major triad + Major 7th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MAJ]).toEqual([
        0, INTERVALS.M3, INTERVALS.P5, INTERVALS.M7,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MAJ]).toEqual([0, 4, 7, 11]);

      // Dominant 7th: Major triad + Minor 7th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_DOM]).toEqual([
        0, INTERVALS.M3, INTERVALS.P5, INTERVALS.m7,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_DOM]).toEqual([0, 4, 7, 10]);

      // Minor 7th: Minor triad + Minor 7th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MIN]).toEqual([
        0, INTERVALS.m3, INTERVALS.P5, INTERVALS.m7,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MIN]).toEqual([0, 3, 7, 10]);

      // Half-diminished 7th: Diminished triad + Minor 7th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_HALF_DIM]).toEqual([
        0, INTERVALS.m3, INTERVALS.d5, INTERVALS.m7,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_HALF_DIM]).toEqual([0, 3, 6, 10]);

      // Fully diminished 7th: Diminished triad + Diminished 7th
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_FULL_DIM]).toEqual([
        0, INTERVALS.m3, INTERVALS.d5, INTERVALS.d7,
      ]);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_FULL_DIM]).toEqual([0, 3, 6, 9]);
    });

    it('should have all intervals as valid integers', () => {
      Object.values(CHORD_TYPE_INTERVALS_MAP).forEach((intervals) => {
        intervals.forEach((interval) => {
          expect(interval).toBeValidInterval();
          expect(interval).toBeGreaterThanOrEqual(0);
          expect(interval).toBeLessThanOrEqual(12);
        });
      });
    });

    it('should always start with root note (0)', () => {
      Object.values(CHORD_TYPE_INTERVALS_MAP).forEach((intervals) => {
        expect(intervals[0]).toBe(0);
      });
    });

    it('should have triads with 3 notes and sevenths with 4 notes', () => {
      // Triads should have 3 notes
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MAJOR]).toHaveLength(3);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.MINOR]).toHaveLength(3);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.DIM]).toHaveLength(3);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.AUG]).toHaveLength(3);

      // Seventh chords should have 4 notes
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MAJ]).toHaveLength(4);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_DOM]).toHaveLength(4);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_MIN]).toHaveLength(4);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_HALF_DIM]).toHaveLength(4);
      expect(CHORD_TYPE_INTERVALS_MAP[CHORD_TYPE_ENUM.SEVENTH_FULL_DIM]).toHaveLength(4);
    });

    it('should have intervals in ascending order', () => {
      Object.values(CHORD_TYPE_INTERVALS_MAP).forEach((intervals) => {
        for (let i = 1; i < intervals.length; i++) {
          expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
        }
      });
    });
  });

  describe('buildChord', () => {
    describe('Basic Triads', () => {
      it('should build major triads correctly', () => {
        // C major: C, E, G
        expect(buildChord(0, CHORD_TYPE_ENUM.MAJOR)).toEqual([0, 4, 7]);
        expect(buildChord(0, CHORD_TYPE_ENUM.MAJOR)).toBeValidChord();

        // G major: G, B, D
        expect(buildChord(7, CHORD_TYPE_ENUM.MAJOR)).toEqual([7, 11, 2]);
        expect(buildChord(7, CHORD_TYPE_ENUM.MAJOR)).toBeValidChord();

        // F# major: F#, A#, C#
        expect(buildChord(6, CHORD_TYPE_ENUM.MAJOR)).toEqual([6, 10, 1]);
        expect(buildChord(6, CHORD_TYPE_ENUM.MAJOR)).toBeValidChord();
      });

      it('should build minor triads correctly', () => {
        // C minor: C, Eb, G
        expect(buildChord(0, CHORD_TYPE_ENUM.MINOR)).toEqual([0, 3, 7]);
        expect(buildChord(0, CHORD_TYPE_ENUM.MINOR)).toBeValidChord();

        // A minor: A, C, E
        expect(buildChord(9, CHORD_TYPE_ENUM.MINOR)).toEqual([9, 0, 4]);
        expect(buildChord(9, CHORD_TYPE_ENUM.MINOR)).toBeValidChord();

        // D minor: D, F, A
        expect(buildChord(2, CHORD_TYPE_ENUM.MINOR)).toEqual([2, 5, 9]);
        expect(buildChord(2, CHORD_TYPE_ENUM.MINOR)).toBeValidChord();
      });

      it('should build diminished triads correctly', () => {
        // C diminished: C, Eb, Gb
        expect(buildChord(0, CHORD_TYPE_ENUM.DIM)).toEqual([0, 3, 6]);
        expect(buildChord(0, CHORD_TYPE_ENUM.DIM)).toBeValidChord();

        // F# diminished: F#, A, C
        expect(buildChord(6, CHORD_TYPE_ENUM.DIM)).toEqual([6, 9, 0]);
        expect(buildChord(6, CHORD_TYPE_ENUM.DIM)).toBeValidChord();

        // B diminished: B, D, F
        expect(buildChord(11, CHORD_TYPE_ENUM.DIM)).toEqual([11, 2, 5]);
        expect(buildChord(11, CHORD_TYPE_ENUM.DIM)).toBeValidChord();
      });

      it('should build augmented triads correctly', () => {
        // C augmented: C, E, G#
        expect(buildChord(0, CHORD_TYPE_ENUM.AUG)).toEqual([0, 4, 8]);
        expect(buildChord(0, CHORD_TYPE_ENUM.AUG)).toBeValidChord();

        // F augmented: F, A, C#
        expect(buildChord(5, CHORD_TYPE_ENUM.AUG)).toEqual([5, 9, 1]);
        expect(buildChord(5, CHORD_TYPE_ENUM.AUG)).toBeValidChord();

        // Bb augmented: Bb, D, F#
        expect(buildChord(10, CHORD_TYPE_ENUM.AUG)).toEqual([10, 2, 6]);
        expect(buildChord(10, CHORD_TYPE_ENUM.AUG)).toBeValidChord();
      });
    });

    describe('Seventh Chords', () => {
      it('should build major seventh chords correctly', () => {
        // C major 7th: C, E, G, B
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toEqual([0, 4, 7, 11]);
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toBeValidChord();

        // F major 7th: F, A, C, E
        expect(buildChord(5, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toEqual([5, 9, 0, 4]);
        expect(buildChord(5, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toBeValidChord();

        // G major 7th: G, B, D, F#
        expect(buildChord(7, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toEqual([7, 11, 2, 6]);
        expect(buildChord(7, CHORD_TYPE_ENUM.SEVENTH_MAJ)).toBeValidChord();
      });

      it('should build dominant seventh chords correctly', () => {
        // C dominant 7th: C, E, G, Bb
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_DOM)).toEqual([0, 4, 7, 10]);
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_DOM)).toBeValidChord();

        // G dominant 7th: G, B, D, F
        expect(buildChord(7, CHORD_TYPE_ENUM.SEVENTH_DOM)).toEqual([7, 11, 2, 5]);
        expect(buildChord(7, CHORD_TYPE_ENUM.SEVENTH_DOM)).toBeValidChord();

        // D dominant 7th: D, F#, A, C
        expect(buildChord(2, CHORD_TYPE_ENUM.SEVENTH_DOM)).toEqual([2, 6, 9, 0]);
        expect(buildChord(2, CHORD_TYPE_ENUM.SEVENTH_DOM)).toBeValidChord();
      });

      it('should build minor seventh chords correctly', () => {
        // C minor 7th: C, Eb, G, Bb
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_MIN)).toEqual([0, 3, 7, 10]);
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_MIN)).toBeValidChord();

        // A minor 7th: A, C, E, G
        expect(buildChord(9, CHORD_TYPE_ENUM.SEVENTH_MIN)).toEqual([9, 0, 4, 7]);
        expect(buildChord(9, CHORD_TYPE_ENUM.SEVENTH_MIN)).toBeValidChord();

        // D minor 7th: D, F, A, C
        expect(buildChord(2, CHORD_TYPE_ENUM.SEVENTH_MIN)).toEqual([2, 5, 9, 0]);
        expect(buildChord(2, CHORD_TYPE_ENUM.SEVENTH_MIN)).toBeValidChord();
      });

      it('should build half-diminished seventh chords correctly', () => {
        // C half-diminished 7th: C, Eb, Gb, Bb
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toEqual([0, 3, 6, 10]);
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toBeValidChord();

        // F# half-diminished 7th: F#, A, C, E
        expect(buildChord(6, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toEqual([6, 9, 0, 4]);
        expect(buildChord(6, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toBeValidChord();

        // B half-diminished 7th: B, D, F, A
        expect(buildChord(11, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toEqual([11, 2, 5, 9]);
        expect(buildChord(11, CHORD_TYPE_ENUM.SEVENTH_HALF_DIM)).toBeValidChord();
      });

      it('should build fully diminished seventh chords correctly', () => {
        // C fully diminished 7th: C, Eb, Gb, A
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toEqual([0, 3, 6, 9]);
        expect(buildChord(0, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toBeValidChord();

        // F# fully diminished 7th: F#, A, C, Eb
        expect(buildChord(6, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toEqual([6, 9, 0, 3]);
        expect(buildChord(6, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toBeValidChord();

        // B fully diminished 7th: B, D, F, Ab
        expect(buildChord(11, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toEqual([11, 2, 5, 8]);
        expect(buildChord(11, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM)).toBeValidChord();
      });
    });

    describe('All Root Notes', () => {
      it('should build chords from all 12 root notes', () => {
        for (let root = 0; root < 12; root++) {
          const chord = buildChord(root as Note, CHORD_TYPE_ENUM.MAJOR);
          expect(chord).toBeValidChord();
          expect(chord[0]).toBe(root); // Root note should be first
          expect(chord).toHaveLength(3); // Major triad has 3 notes
        }
      });

      it('should always include the root note first', () => {
        Object.values(CHORD_TYPE_ENUM).forEach((chordType) => {
          for (let root = 0; root < 12; root++) {
            const chord = buildChord(root as Note, chordType);
            expect(chord[0]).toBe(root);
          }
        });
      });

      it('should always return valid notes', () => {
        Object.values(CHORD_TYPE_ENUM).forEach((chordType) => {
          for (let root = 0; root < 12; root++) {
            const chord = buildChord(root as Note, chordType);
            chord.forEach((note) => {
              expect(note).toBeValidNote();
            });
          }
        });
      });
    });

    describe('Chord Properties', () => {
      it('should handle octave wrapping correctly', () => {
        // Build chord from high root note to test wrapping
        const chord = buildChord(11, CHORD_TYPE_ENUM.MAJOR); // B major
        expect(chord).toEqual([11, 3, 6]); // B, D#, F#
        expect(chord).toBeValidChord();
      });

      it('should maintain chord interval relationships', () => {
        // Test that interval relationships are preserved regardless of root
        const cMajor = buildChord(0, CHORD_TYPE_ENUM.MAJOR);
        const gMajor = buildChord(7, CHORD_TYPE_ENUM.MAJOR);

        // Check that the intervals between notes are the same
        const cIntervals = [
          (cMajor[1] - cMajor[0] + 12) % 12,
          (cMajor[2] - cMajor[1] + 12) % 12,
        ];
        const gIntervals = [
          (gMajor[1] - gMajor[0] + 12) % 12,
          (gMajor[2] - gMajor[1] + 12) % 12,
        ];

        expect(cIntervals).toEqual(gIntervals);
      });

      it('should produce unique notes within each chord (no duplicates)', () => {
        Object.values(CHORD_TYPE_ENUM).forEach((chordType) => {
          for (let root = 0; root < 12; root++) {
            const chord = buildChord(root as Note, chordType);
            const uniqueNotes = new Set(chord);
            expect(uniqueNotes.size).toBe(chord.length);
          }
        });
      });

      it('should have consistent chord sizes', () => {
        const triadTypes = [
          CHORD_TYPE_ENUM.MAJOR,
          CHORD_TYPE_ENUM.MINOR,
          CHORD_TYPE_ENUM.DIM,
          CHORD_TYPE_ENUM.AUG,
        ];

        const seventhTypes = [
          CHORD_TYPE_ENUM.SEVENTH_MAJ,
          CHORD_TYPE_ENUM.SEVENTH_DOM,
          CHORD_TYPE_ENUM.SEVENTH_MIN,
          CHORD_TYPE_ENUM.SEVENTH_HALF_DIM,
          CHORD_TYPE_ENUM.SEVENTH_FULL_DIM,
        ];

        triadTypes.forEach((chordType) => {
          const chord = buildChord(0, chordType);
          expect(chord).toHaveLength(3);
        });

        seventhTypes.forEach((chordType) => {
          const chord = buildChord(0, chordType);
          expect(chord).toHaveLength(4);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle extreme root notes correctly', () => {
        // Test with boundary notes
        expect(buildChord(0, CHORD_TYPE_ENUM.MAJOR)).toBeValidChord();
        expect(buildChord(11, CHORD_TYPE_ENUM.MAJOR)).toBeValidChord();
      });

      it('should be consistent with repeated calls', () => {
        // Same input should always produce same output
        const chord1 = buildChord(5, CHORD_TYPE_ENUM.SEVENTH_DOM);
        const chord2 = buildChord(5, CHORD_TYPE_ENUM.SEVENTH_DOM);
        expect(chord1).toEqual(chord2);
      });

      it('should handle fully diminished symmetry', () => {
        // Fully diminished chords are symmetrical (every 3 semitones)
        const chord = buildChord(0, CHORD_TYPE_ENUM.SEVENTH_FULL_DIM);
        expect(chord).toEqual([0, 3, 6, 9]);
      });
    });
  });
});
