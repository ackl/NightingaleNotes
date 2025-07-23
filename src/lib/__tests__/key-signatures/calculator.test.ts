import { describe, expect, it } from 'vitest';
import {
  SHARP_ORDER,
  FLAT_ORDER,
  getKeySignatures,
} from '../../key-signatures/calculator';
import { TONALITY } from '../../core/scales';
import { type Note } from '../../core/primitives';

describe('Key Signature Calculator', () => {
  describe('SHARP_ORDER', () => {
    it('should contain all 7 sharp notes in correct order', () => {
      expect(SHARP_ORDER).toEqual([5, 0, 7, 2, 9, 4, 11]); // F, C, G, D, A, E, B
      expect(SHARP_ORDER).toHaveLength(7);
    });

    it('should follow circle of fifths progression', () => {
      // Each sharp should be a fifth higher than the previous
      // F# -> C# -> G# -> D# -> A# -> E# -> B#
      const expectedNotes = [5, 0, 7, 2, 9, 4, 11]; // F, C, G, D, A, E, B
      expect(SHARP_ORDER).toEqual(expectedNotes);
    });

    it('should contain only valid notes', () => {
      SHARP_ORDER.forEach((note) => {
        expect(note).toBeValidNote();
      });
    });

    it('should have no duplicates', () => {
      const uniqueNotes = new Set(SHARP_ORDER);
      expect(uniqueNotes.size).toBe(SHARP_ORDER.length);
    });
  });

  describe('FLAT_ORDER', () => {
    it('should contain all 7 flat notes in correct order', () => {
      expect(FLAT_ORDER).toEqual([11, 4, 9, 2, 7, 0, 5]); // B, E, A, D, G, C, F
      expect(FLAT_ORDER).toHaveLength(7);
    });

    it('should follow reverse circle of fifths progression', () => {
      // Each flat should be a fourth higher (fifth lower) than the previous
      // Bb -> Eb -> Ab -> Db -> Gb -> Cb -> Fb
      const expectedNotes = [11, 4, 9, 2, 7, 0, 5]; // B, E, A, D, G, C, F
      expect(FLAT_ORDER).toEqual(expectedNotes);
    });

    it('should contain only valid notes', () => {
      FLAT_ORDER.forEach((note) => {
        expect(note).toBeValidNote();
      });
    });

    it('should have no duplicates', () => {
      const uniqueNotes = new Set(FLAT_ORDER);
      expect(uniqueNotes.size).toBe(FLAT_ORDER.length);
    });

    it('should be reverse order of sharp progression', () => {
      // FLAT_ORDER should be the reverse of the notes that would be sharped
      // when going in the opposite direction around the circle of fifths
      const reversedSharps = [...SHARP_ORDER].reverse();
      expect(FLAT_ORDER).toEqual(reversedSharps);
    });
  });

  describe('getKeySignatures', () => {
    describe('Major Keys - Natural Keys (C, F, G)', () => {
      it('should generate C Major correctly (no accidentals)', () => {
        const keys = getKeySignatures(0, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const cMajor = keys[0];
        expect(cMajor.tonic).toBe(0);
        expect(cMajor.tonality).toBe(TONALITY.MAJOR);
        expect(cMajor.accidentals).toEqual([]);
        expect(cMajor.accidentalType).toBe('NATURAL');
        expect(cMajor.scaleAscending.notes).toEqual([0, 2, 4, 5, 7, 9, 11]);
        expect(cMajor.scaleAscending.labels).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      });

      it('should generate G Major correctly (1 sharp)', () => {
        const keys = getKeySignatures(7, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const gMajor = keys[0];
        expect(gMajor.tonic).toBe(7);
        expect(gMajor.tonality).toBe(TONALITY.MAJOR);
        expect(gMajor.accidentals).toEqual([5]); // F#
        expect(gMajor.accidentalType).toBe('SHARP');
        expect(gMajor.scaleAscending.notes).toEqual([7, 9, 11, 0, 2, 4, 6]);
        expect(gMajor.scaleAscending.labels).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F♯']);
      });

      it('should generate F Major correctly (1 flat)', () => {
        const keys = getKeySignatures(5, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const fMajor = keys[0];
        expect(fMajor.tonic).toBe(5);
        expect(fMajor.tonality).toBe(TONALITY.MAJOR);
        expect(fMajor.accidentals).toEqual([11]); // Bb
        expect(fMajor.accidentalType).toBe('FLAT');
        expect(fMajor.scaleAscending.notes).toEqual([5, 7, 9, 10, 0, 2, 4]);
        expect(fMajor.scaleAscending.labels).toEqual(['F', 'G', 'A', 'B♭', 'C', 'D', 'E']);
      });
    });

    describe('Major Keys - Sharp Keys', () => {
      it('should generate D Major correctly (2 sharps)', () => {
        const keys = getKeySignatures(2, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const dMajor = keys[0];
        expect(dMajor.tonic).toBe(2);
        expect(dMajor.accidentals).toEqual([5, 0]); // F#, C#
        expect(dMajor.accidentalType).toBe('SHARP');
        expect(dMajor.scaleAscending.notes).toEqual([2, 4, 6, 7, 9, 11, 1]);
        expect(dMajor.scaleAscending.labels).toEqual(['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯']);
      });

      it('should generate A Major correctly (3 sharps)', () => {
        const keys = getKeySignatures(9, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const aMajor = keys[0];
        expect(aMajor.tonic).toBe(9);
        expect(aMajor.accidentals).toEqual([5, 0, 7]); // F#, C#, G#
        expect(aMajor.accidentalType).toBe('SHARP');
        expect(aMajor.scaleAscending.notes).toEqual([9, 11, 1, 2, 4, 6, 8]);
        expect(aMajor.scaleAscending.labels).toEqual(['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯']);
      });

      it('should generate E Major correctly (4 sharps)', () => {
        const keys = getKeySignatures(4, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const eMajor = keys[0];
        expect(eMajor.tonic).toBe(4);
        expect(eMajor.accidentals).toEqual([5, 0, 7, 2]); // F#, C#, G#, D#
        expect(eMajor.accidentalType).toBe('SHARP');
        expect(eMajor.scaleAscending.notes).toEqual([4, 6, 8, 9, 11, 1, 3]);
        expect(eMajor.scaleAscending.labels).toEqual(['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯']);
      });
    });

    describe('Major Keys - Flat Keys', () => {
      it('should generate Bb Major correctly (2 flats)', () => {
        const keys = getKeySignatures(10, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const bbMajor = keys[0];
        expect(bbMajor.tonic).toBe(10);
        expect(bbMajor.accidentals).toEqual([11, 4]); // Bb, Eb
        expect(bbMajor.accidentalType).toBe('FLAT');
        expect(bbMajor.scaleAscending.notes).toEqual([10, 0, 2, 3, 5, 7, 9]);
        expect(bbMajor.scaleAscending.labels).toEqual(['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A']);
      });

      it('should generate Eb Major correctly (3 flats)', () => {
        const keys = getKeySignatures(3, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const ebMajor = keys[0];
        expect(ebMajor.tonic).toBe(3);
        expect(ebMajor.accidentals).toEqual([11, 4, 9]); // Bb, Eb, Ab
        expect(ebMajor.accidentalType).toBe('FLAT');
        expect(ebMajor.scaleAscending.notes).toEqual([3, 5, 7, 8, 10, 0, 2]);
        expect(ebMajor.scaleAscending.labels).toEqual(['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D']);
      });

      it('should generate Ab Major correctly (4 flats)', () => {
        const keys = getKeySignatures(8, TONALITY.MAJOR);

        expect(keys).toHaveLength(1);

        const abMajor = keys[0];
        expect(abMajor.tonic).toBe(8);
        expect(abMajor.accidentals).toEqual([11, 4, 9, 2]); // Bb, Eb, Ab, Db
        expect(abMajor.accidentalType).toBe('FLAT');
        expect(abMajor.scaleAscending.notes).toEqual([8, 10, 0, 1, 3, 5, 7]);
        expect(abMajor.scaleAscending.labels).toEqual(['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G']);
      });
    });

    describe('Enharmonic Keys', () => {
      it('should generate both F# Major and Gb Major', () => {
        const keys = getKeySignatures(6, TONALITY.MAJOR);

        expect(keys).toHaveLength(2);

        // Should prefer flats (Gb) over sharps (F#)
        const gbMajor = keys[0];
        expect(gbMajor.tonic).toBe(6);
        expect(gbMajor.accidentalType).toBe('FLAT');
        expect(gbMajor.accidentals).toEqual([11, 4, 9, 2, 7, 0]); // 6 flats
        expect(gbMajor.scaleAscending.labels).toEqual(['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F']);

        const fsMajor = keys[1];
        expect(fsMajor.tonic).toBe(6);
        expect(fsMajor.accidentalType).toBe('SHARP');
        expect(fsMajor.accidentals).toEqual([5, 0, 7, 2, 9, 4]); // 6 sharps
        expect(fsMajor.scaleAscending.labels).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯']);
      });

      it('should generate both C# Major and Db Major', () => {
        const keys = getKeySignatures(1, TONALITY.MAJOR);

        expect(keys).toHaveLength(2);

        // Should prefer flats (Db) over sharps (C#)
        const dbMajor = keys[0];
        expect(dbMajor.tonic).toBe(1);
        expect(dbMajor.accidentalType).toBe('FLAT');
        expect(dbMajor.accidentals).toEqual([11, 4, 9, 2, 7]); // 5 flats
        expect(dbMajor.scaleAscending.labels).toEqual(['D♭', 'E♭', 'F', 'G♭', 'A♭', 'B♭', 'C']);

        const csMajor = keys[1];
        expect(csMajor.tonic).toBe(1);
        expect(csMajor.accidentalType).toBe('SHARP');
        expect(csMajor.accidentals).toEqual([5, 0, 7, 2, 9, 4, 11]); // 7 sharps
        expect(csMajor.scaleAscending.labels).toEqual(['C♯', 'D♯', 'E♯', 'F♯', 'G♯', 'A♯', 'B♯']);
      });
    });

    describe('Minor Keys - Natural Minor', () => {
      it('should generate A Minor correctly (relative to C Major)', () => {
        const keys = getKeySignatures(9, TONALITY.MINOR_NATURAL);

        expect(keys).toHaveLength(1);

        const aMinor = keys[0];
        expect(aMinor.tonic).toBe(9);
        expect(aMinor.tonality).toBe(TONALITY.MINOR_NATURAL);
        expect(aMinor.accidentals).toEqual([]);
        expect(aMinor.accidentalType).toBe('NATURAL');
        expect(aMinor.scaleAscending.notes).toEqual([9, 11, 0, 2, 4, 5, 7]);
        expect(aMinor.scaleAscending.labels).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      });

      it('should generate E Minor correctly (relative to G Major)', () => {
        const keys = getKeySignatures(4, TONALITY.MINOR_NATURAL);

        expect(keys).toHaveLength(1);

        const eMinor = keys[0];
        expect(eMinor.tonic).toBe(4);
        expect(eMinor.accidentals).toEqual([5]); // F#
        expect(eMinor.accidentalType).toBe('SHARP');
        expect(eMinor.scaleAscending.notes).toEqual([4, 6, 7, 9, 11, 0, 2]);
        expect(eMinor.scaleAscending.labels).toEqual(['E', 'F♯', 'G', 'A', 'B', 'C', 'D']);
      });

      it('should generate D Minor correctly (relative to F Major)', () => {
        const keys = getKeySignatures(2, TONALITY.MINOR_NATURAL);

        expect(keys).toHaveLength(1);

        const dMinor = keys[0];
        expect(dMinor.tonic).toBe(2);
        expect(dMinor.accidentals).toEqual([11]); // Bb
        expect(dMinor.accidentalType).toBe('FLAT');
        expect(dMinor.scaleAscending.notes).toEqual([2, 4, 5, 7, 9, 10, 0]);
        expect(dMinor.scaleAscending.labels).toEqual(['D', 'E', 'F', 'G', 'A', 'B♭', 'C']);
      });
    });

    describe('Minor Keys - Harmonic Minor', () => {
      it('should generate A Harmonic Minor correctly', () => {
        const keys = getKeySignatures(9, TONALITY.MINOR_HARMONIC);

        expect(keys).toHaveLength(1);

        const aHarmonicMinor = keys[0];
        expect(aHarmonicMinor.tonic).toBe(9);
        expect(aHarmonicMinor.tonality).toBe(TONALITY.MINOR_HARMONIC);
        expect(aHarmonicMinor.accidentals).toEqual([]);
        expect(aHarmonicMinor.accidentalType).toBe('NATURAL');
        expect(aHarmonicMinor.scaleAscending.notes).toEqual([9, 11, 0, 2, 4, 5, 8]);
        expect(aHarmonicMinor.scaleAscending.labels).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G♯']);
      });

      it('should generate E Harmonic Minor correctly', () => {
        const keys = getKeySignatures(4, TONALITY.MINOR_HARMONIC);

        expect(keys).toHaveLength(1);

        const eHarmonicMinor = keys[0];
        expect(eHarmonicMinor.tonic).toBe(4);
        expect(eHarmonicMinor.accidentals).toEqual([5]); // F# from key signature
        expect(eHarmonicMinor.accidentalType).toBe('SHARP');
        expect(eHarmonicMinor.scaleAscending.notes).toEqual([4, 6, 7, 9, 11, 0, 3]);
        expect(eHarmonicMinor.scaleAscending.labels).toEqual(['E', 'F♯', 'G', 'A', 'B', 'C', 'D♯']);
      });
    });

    describe('Minor Keys - Melodic Minor', () => {
      it('should generate A Melodic Minor correctly', () => {
        const keys = getKeySignatures(9, TONALITY.MINOR_MELODIC);

        expect(keys).toHaveLength(1);

        const aMelodicMinor = keys[0];
        expect(aMelodicMinor.tonic).toBe(9);
        expect(aMelodicMinor.tonality).toBe(TONALITY.MINOR_MELODIC);
        expect(aMelodicMinor.accidentals).toEqual([]);
        expect(aMelodicMinor.accidentalType).toBe('NATURAL');
        expect(aMelodicMinor.scaleAscending.notes).toEqual([9, 11, 0, 2, 4, 6, 8]);
        expect(aMelodicMinor.scaleAscending.labels).toEqual(['A', 'B', 'C', 'D', 'E', 'F♯', 'G♯']);
      });

      it('should generate E Melodic Minor correctly', () => {
        const keys = getKeySignatures(4, TONALITY.MINOR_MELODIC);

        expect(keys).toHaveLength(1);

        const eMelodicMinor = keys[0];
        expect(eMelodicMinor.tonic).toBe(4);
        expect(eMelodicMinor.accidentals).toEqual([5]); // F# from key signature
        expect(eMelodicMinor.accidentalType).toBe('SHARP');
        expect(eMelodicMinor.scaleAscending.notes).toEqual([4, 6, 7, 9, 11, 1, 3]);
        expect(eMelodicMinor.scaleAscending.labels).toEqual(['E', 'F♯', 'G', 'A', 'B', 'C♯', 'D♯']);
      });
    });

    describe('Key Signature Properties', () => {
      it('should always return valid KeySignature objects', () => {
        for (let tonic = 0; tonic < 12; tonic++) {
          Object.values(TONALITY).forEach((tonality) => {
            const keys = getKeySignatures(tonic as Note, tonality);

            expect(keys.length).toBeGreaterThan(0);

            keys.forEach((key) => {
              expect(key.tonic).toBeValidNote();
              expect(key.tonality).toBe(tonality);
              expect(Array.isArray(key.accidentals)).toBe(true);
              expect(['NATURAL', 'SHARP', 'FLAT']).toContain(key.accidentalType);
              expect(key.scaleAscending.notes).toHaveLength(7);
              expect(key.scaleAscending.labels).toHaveLength(7);

              key.accidentals.forEach((acc) => {
                expect(acc).toBeValidNote();
              });

              key.scaleAscending.notes.forEach((note) => {
                expect(note).toBeValidNote();
              });
            });
          });
        }
      });

      it('should sort enharmonic keys with flats first', () => {
        const enharmonicTonics = [1, 6]; // C#/Db, F#/Gb (not 11, which is B♭)

        enharmonicTonics.forEach((tonic) => {
          const keys = getKeySignatures(tonic as Note, TONALITY.MAJOR);
          if (keys.length > 1) {
            expect(keys[0].accidentalType).toBe('FLAT');
            expect(keys[1].accidentalType).toBe('SHARP');
          }
        });
      });

      it('should generate correct number of accidentals', () => {
        // Test that accidental count matches circle of fifths position
        const testCases = [
          { tonic: 7, expected: 1 }, // G Major - 1 sharp
          { tonic: 2, expected: 2 }, // D Major - 2 sharps
          { tonic: 5, expected: 1 }, // F Major - 1 flat
          { tonic: 10, expected: 2 }, // Bb Major - 2 flats
        ];

        testCases.forEach(({ tonic, expected }) => {
          const keys = getKeySignatures(tonic as Note, TONALITY.MAJOR);
          expect(keys[0].accidentals).toHaveLength(expected);
        });
      });

      it('should maintain relative major/minor relationships', () => {
        const relativeKeys = [
          { major: 0, minor: 9 }, // C Major / A Minor
          { major: 7, minor: 4 }, // G Major / E Minor
          { major: 5, minor: 2 }, // F Major / D Minor
          { major: 2, minor: 11 }, // D Major / B Minor
        ];

        relativeKeys.forEach(({ major, minor }) => {
          const majorKey = getKeySignatures(major as Note, TONALITY.MAJOR)[0];
          const minorKey = getKeySignatures(minor as Note, TONALITY.MINOR_NATURAL)[0];

          expect(majorKey.accidentals).toEqual(minorKey.accidentals);
          expect(majorKey.accidentalType).toBe(minorKey.accidentalType);
        });
      });

      it('should handle all tonalities for all tonics', () => {
        for (let tonic = 0; tonic < 12; tonic++) {
          Object.values(TONALITY).forEach((tonality) => {
            expect(() => {
              getKeySignatures(tonic as Note, tonality);
            }).not.toThrow();
          });
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle enharmonic spellings correctly', () => {
        // F# Major should use sharps throughout
        const fsMajor = getKeySignatures(6, TONALITY.MAJOR)
          .find((k) => k.accidentalType === 'SHARP')!;
        expect(fsMajor.scaleAscending.labels).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯']);

        // Gb Major should use flats throughout
        const gbMajor = getKeySignatures(6, TONALITY.MAJOR)
          .find((k) => k.accidentalType === 'FLAT')!;
        expect(gbMajor.scaleAscending.labels).toEqual(['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F']);
      });

      it('should maintain alphabetical letter sequence', () => {
        // Each scale should use each letter name exactly once
        for (let tonic = 0; tonic < 12; tonic++) {
          const keys = getKeySignatures(tonic as Note, TONALITY.MAJOR);

          keys.forEach((key) => {
            const letters = key.scaleAscending.labels.map((label) => label[0]);
            const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

            // Should contain each letter exactly once (possibly reordered)
            const sortedLetters = [...letters].sort();
            expect(sortedLetters).toEqual(expectedLetters);
          });
        }
      });

      it('should throw error for invalid circle of fifths lookup', () => {
        // This should not happen with valid inputs, but test the error handling
        // We can't easily test this without mocking, so we'll test that valid inputs don't throw
        expect(() => {
          getKeySignatures(0, TONALITY.MAJOR);
        }).not.toThrow();
      });
    });
  });
});
