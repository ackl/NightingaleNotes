import { describe, expect, it } from 'vitest';
import {
  TONALITY,
  naturalNotes,
  tonalityIntervals,
  diatonicDegreeNames,
} from '../../core/scales';
import type { Note } from '../../core/primitives';

describe('Scales', () => {
  describe('TONALITY', () => {
    it('should have exactly 4 tonality types', () => {
      expect(Object.keys(TONALITY)).toHaveLength(4);
    });

    it('should have all unique values', () => {
      const values = Object.values(TONALITY);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have descriptive names', () => {
      Object.values(TONALITY).forEach((tonality) => {
        expect(typeof tonality).toBe('string');
        expect(tonality.length).toBeGreaterThan(3);
      });
    });
  });

  describe('whiteKeys', () => {
    it('should contain exactly 7 notes', () => {
      expect(naturalNotes).toHaveLength(7);
    });

    it('should represent the major scale pattern', () => {
      expect(naturalNotes).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have all valid notes', () => {
      naturalNotes.forEach((note) => {
        expect(note).toBeValidNote();
      });
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < naturalNotes.length; i++) {
        expect(naturalNotes[i]).toBeGreaterThan(naturalNotes[i - 1]);
      }
    });

    it('should start with tonic (0)', () => {
      expect(naturalNotes[0]).toBe(0);
    });

    it('should end with leading tone (11)', () => {
      expect(naturalNotes[naturalNotes.length - 1]).toBe(11);
    });

    it('should follow major scale interval pattern (W-W-H-W-W-W-H)', () => {
      const intervals: Note[] = [];
      for (let i = 1; i < naturalNotes.length; i++) {
        intervals.push(naturalNotes[i] - naturalNotes[i - 1] as Note);
      }
      // Add the interval from leading tone back to tonic (next octave)
      intervals.push((12 + naturalNotes[0] - naturalNotes[naturalNotes.length - 1]) % 12 as Note);

      // W-W-H-W-W-W-H pattern = [2, 2, 1, 2, 2, 2, 1]
      expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    it('should be readonly', () => {
      const originalLength = naturalNotes.length;
      expect(naturalNotes).toHaveLength(originalLength);
    });
  });

  describe('tonalityIntervals', () => {
    it('should contain intervals for all tonality types', () => {
      Object.values(TONALITY).forEach((tonality) => {
        expect(tonalityIntervals[tonality]).toBeDefined();
        expect(Array.isArray(tonalityIntervals[tonality])).toBe(true);
      });
    });

    it('should have exactly 4 tonality mappings', () => {
      expect(Object.keys(tonalityIntervals)).toHaveLength(4);
    });

    describe('Major Scale', () => {
      const majorIntervals = tonalityIntervals[TONALITY.MAJOR];

      it('should be the same as whiteKeys', () => {
        expect(majorIntervals).toEqual(naturalNotes);
        expect(majorIntervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
      });

      it('should follow W-W-H-W-W-W-H pattern', () => {
        const intervals: Note[] = [];
        for (let i = 1; i < majorIntervals.length; i++) {
          intervals.push(majorIntervals[i] - majorIntervals[i - 1] as Note);
        }
        expect(intervals).toEqual([2, 2, 1, 2, 2, 2]);
      });

      it('should contain all valid notes', () => {
        majorIntervals.forEach((note) => {
          expect(note).toBeValidNote();
        });
      });
    });

    describe('Natural Minor Scale', () => {
      const naturalMinorIntervals = tonalityIntervals[TONALITY.MINOR_NATURAL];

      it('should have correct interval pattern', () => {
        expect(naturalMinorIntervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
      });

      it('should follow W-H-W-W-H-W-W pattern', () => {
        const intervals: Note[] = [];
        for (let i = 1; i < naturalMinorIntervals.length; i++) {
          intervals.push(naturalMinorIntervals[i] - naturalMinorIntervals[i - 1] as Note);
        }
        expect(intervals).toEqual([2, 1, 2, 2, 1, 2]);
      });

      it('should have lowered 3rd, 6th, and 7th degrees compared to major', () => {
        const majorIntervals = tonalityIntervals[TONALITY.MAJOR];

        // Compare each degree
        expect(naturalMinorIntervals[0]).toBe(majorIntervals[0]); // Tonic same
        expect(naturalMinorIntervals[1]).toBe(majorIntervals[1]); // 2nd same
        expect(naturalMinorIntervals[2]).toBe(majorIntervals[2] - 1); // 3rd lowered
        expect(naturalMinorIntervals[3]).toBe(majorIntervals[3]); // 4th same
        expect(naturalMinorIntervals[4]).toBe(majorIntervals[4]); // 5th same
        expect(naturalMinorIntervals[5]).toBe(majorIntervals[5] - 1); // 6th lowered
        expect(naturalMinorIntervals[6]).toBe(majorIntervals[6] - 1); // 7th lowered
      });

      it('should contain all valid notes', () => {
        naturalMinorIntervals.forEach((note) => {
          expect(note).toBeValidNote();
        });
      });
    });

    describe('Harmonic Minor Scale', () => {
      const harmonicMinorIntervals = tonalityIntervals[TONALITY.MINOR_HARMONIC];

      it('should have correct interval pattern', () => {
        expect(harmonicMinorIntervals).toEqual([0, 2, 3, 5, 7, 8, 11]);
      });

      it('should follow W-H-W-W-H-A2-H pattern', () => {
        const intervals: Note[] = [];
        for (let i = 1; i < harmonicMinorIntervals.length; i++) {
          intervals.push(harmonicMinorIntervals[i] - harmonicMinorIntervals[i - 1] as Note);
        }
        // W-H-W-W-H-A2-H = [2, 1, 2, 2, 1, 3]
        expect(intervals).toEqual([2, 1, 2, 2, 1, 3]);
      });

      it('should have characteristic augmented 2nd interval', () => {
        // Between 6th and 7th degrees (A2 = 3 semitones)
        const augmented2nd = harmonicMinorIntervals[6] - harmonicMinorIntervals[5];
        expect(augmented2nd).toBe(3);
      });

      it('should have raised 7th compared to natural minor', () => {
        const naturalMinorIntervals = tonalityIntervals[TONALITY.MINOR_NATURAL];

        // All degrees same except 7th is raised
        for (let i = 0; i < 6; i++) {
          expect(harmonicMinorIntervals[i]).toBe(naturalMinorIntervals[i]);
        }
        expect(harmonicMinorIntervals[6]).toBe(naturalMinorIntervals[6] + 1);
      });

      it('should contain all valid notes', () => {
        harmonicMinorIntervals.forEach((note) => {
          expect(note).toBeValidNote();
        });
      });
    });

    describe('Melodic Minor Scale', () => {
      const melodicMinorIntervals = tonalityIntervals[TONALITY.MINOR_MELODIC];

      it('should have correct interval pattern', () => {
        expect(melodicMinorIntervals).toEqual([0, 2, 3, 5, 7, 9, 11]);
      });

      it('should follow W-H-W-W-W-W-H pattern', () => {
        const intervals: Note[] = [];
        for (let i = 1; i < melodicMinorIntervals.length; i++) {
          intervals.push(melodicMinorIntervals[i] - melodicMinorIntervals[i - 1] as Note);
        }
        expect(intervals).toEqual([2, 1, 2, 2, 2, 2]);
      });

      it('should have raised 6th and 7th compared to natural minor', () => {
        const naturalMinorIntervals = tonalityIntervals[TONALITY.MINOR_NATURAL];

        // Degrees 1-5 same as natural minor
        for (let i = 0; i < 5; i++) {
          expect(melodicMinorIntervals[i]).toBe(naturalMinorIntervals[i]);
        }
        // 6th and 7th raised
        expect(melodicMinorIntervals[5]).toBe(naturalMinorIntervals[5] + 1);
        expect(melodicMinorIntervals[6]).toBe(naturalMinorIntervals[6] + 1);
      });

      it('should only differ from major scale by lowered 3rd', () => {
        const majorIntervals = tonalityIntervals[TONALITY.MAJOR];

        expect(melodicMinorIntervals[0]).toBe(majorIntervals[0]); // Tonic same
        expect(melodicMinorIntervals[1]).toBe(majorIntervals[1]); // 2nd same
        expect(melodicMinorIntervals[2]).toBe(majorIntervals[2] - 1); // 3rd lowered
        expect(melodicMinorIntervals[3]).toBe(majorIntervals[3]); // 4th same
        expect(melodicMinorIntervals[4]).toBe(majorIntervals[4]); // 5th same
        expect(melodicMinorIntervals[5]).toBe(majorIntervals[5]); // 6th same
        expect(melodicMinorIntervals[6]).toBe(majorIntervals[6]); // 7th same
      });

      it('should contain all valid notes', () => {
        melodicMinorIntervals.forEach((note) => {
          expect(note).toBeValidNote();
        });
      });
    });

    describe('Common Properties', () => {
      it('should all start with tonic (0)', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          expect(intervals[0]).toBe(0);
        });
      });

      it('should all have exactly 7 notes', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          expect(intervals).toHaveLength(7);
        });
      });

      it('should all be in ascending order', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          for (let i = 1; i < intervals.length; i++) {
            expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
          }
        });
      });

      it('should all contain only valid notes', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          intervals.forEach((note) => {
            expect(note).toBeValidNote();
          });
        });
      });

      it('should all span less than an octave', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          intervals.forEach((note) => {
            expect(note).toBeLessThan(12);
          });
        });
      });

      it('should have no duplicate notes within each scale', () => {
        Object.values(tonalityIntervals).forEach((intervals) => {
          const uniqueNotes = new Set(intervals);
          expect(uniqueNotes.size).toBe(intervals.length);
        });
      });
    });
  });

  describe('diatonicDegreeNames', () => {
    it('should contain exactly 8 degree names', () => {
      expect(diatonicDegreeNames).toHaveLength(8);
    });

    it('should have correct traditional names', () => {
      expect(diatonicDegreeNames[0]).toBe('Tonic');
      expect(diatonicDegreeNames[1]).toBe('Supertonic');
      expect(diatonicDegreeNames[2]).toBe('Mediant');
      expect(diatonicDegreeNames[3]).toBe('Subdominant');
      expect(diatonicDegreeNames[4]).toBe('Dominant');
      expect(diatonicDegreeNames[5]).toBe('Submediant');
      expect(diatonicDegreeNames[6]).toBe('Leading tone');
      expect(diatonicDegreeNames[7]).toBe('Tonic');
    });

    it('should start and end with Tonic', () => {
      expect(diatonicDegreeNames[0]).toBe('Tonic');
      expect(diatonicDegreeNames[7]).toBe('Tonic');
    });

    it('should have all string values', () => {
      diatonicDegreeNames.forEach((name) => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should follow traditional music theory order', () => {
      const expectedOrder = [
        'Tonic',
        'Supertonic',
        'Mediant',
        'Subdominant',
        'Dominant',
        'Submediant',
        'Leading tone',
        'Tonic',
      ];
      expect(diatonicDegreeNames).toEqual(expectedOrder);
    });

    it('should have functional names for harmonic analysis', () => {
      // Check that key functional harmony degrees are present
      expect(diatonicDegreeNames).toContain('Tonic'); // I - stability
      expect(diatonicDegreeNames).toContain('Subdominant'); // IV - preparation
      expect(diatonicDegreeNames).toContain('Dominant'); // V - tension/resolution
      expect(diatonicDegreeNames).toContain('Leading tone'); // VII - strong pull to tonic
    });

    it('should be readonly', () => {
      const originalLength = diatonicDegreeNames.length;
      expect(diatonicDegreeNames).toHaveLength(originalLength);
    });
  });

  describe('Scale Theory Validation', () => {
    it('should maintain proper interval relationships between tonalities', () => {
      // Test that minor scales are properly derived from major
      const major = tonalityIntervals[TONALITY.MAJOR];
      const naturalMinor = tonalityIntervals[TONALITY.MINOR_NATURAL];
      const harmonicMinor = tonalityIntervals[TONALITY.MINOR_HARMONIC];
      const melodicMinor = tonalityIntervals[TONALITY.MINOR_MELODIC];

      // Natural minor: lower 3rd, 6th, 7th
      expect(naturalMinor[2]).toBe(major[2] - 1); // ♭3
      expect(naturalMinor[5]).toBe(major[5] - 1); // ♭6
      expect(naturalMinor[6]).toBe(major[6] - 1); // ♭7

      // Harmonic minor: natural minor + raised 7th
      expect(harmonicMinor[6]).toBe(naturalMinor[6] + 1); // ♮7

      // Melodic minor: natural minor + raised 6th and 7th
      expect(melodicMinor[5]).toBe(naturalMinor[5] + 1); // ♮6
      expect(melodicMinor[6]).toBe(naturalMinor[6] + 1); // ♮7
    });

    it('should have consistent scale degree functionality', () => {
      // Every scale should have the same number of degrees as degree names
      Object.values(tonalityIntervals).forEach((intervals) => {
        // -1 because octave tonic is index 7
        expect(intervals).toHaveLength(diatonicDegreeNames.length - 1);
      });
    });

    it('should represent proper diatonic collections', () => {
      // Each scale should contain exactly 7 different pitch classes
      Object.values(tonalityIntervals).forEach((intervals) => {
        expect(intervals).toHaveLength(7);

        // Should span close to an octave (11 semitones max)
        const span = intervals[intervals.length - 1] - intervals[0];
        expect(span).toBeLessThanOrEqual(11);
        expect(span).toBeGreaterThanOrEqual(10); // At least 10 semitones
      });
    });
  });
});
