import { describe, expect, it } from 'vitest';
import { buildDiatonicTriads } from '../../key-signatures/analysis';
import { getKeySignatures } from '../../key-signatures/calculator';
import { TONALITY } from '../../core/scales';
import { type Note } from '../../core/primitives';

describe('Key Signature Analysis', () => {
  describe('buildDiatonicTriads', () => {
    describe('Major Keys', () => {
      it('should build C Major diatonic triads correctly', () => {
        const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(cMajorKey);

        expect(triads).toHaveLength(7);

        // I - C major
        expect(triads[0].notes).toEqual([0, 4, 7]);
        expect(triads[0].labels).toEqual(['C', 'E', 'G']);

        // ii - D minor
        expect(triads[1].notes).toEqual([2, 5, 9]);
        expect(triads[1].labels).toEqual(['D', 'F', 'A']);

        // iii - E minor
        expect(triads[2].notes).toEqual([4, 7, 11]);
        expect(triads[2].labels).toEqual(['E', 'G', 'B']);

        // IV - F major
        expect(triads[3].notes).toEqual([5, 9, 0]);
        expect(triads[3].labels).toEqual(['F', 'A', 'C']);

        // V - G major
        expect(triads[4].notes).toEqual([7, 11, 2]);
        expect(triads[4].labels).toEqual(['G', 'B', 'D']);

        // vi - A minor
        expect(triads[5].notes).toEqual([9, 0, 4]);
        expect(triads[5].labels).toEqual(['A', 'C', 'E']);

        // vii° - B diminished
        expect(triads[6].notes).toEqual([11, 2, 5]);
        expect(triads[6].labels).toEqual(['B', 'D', 'F']);
      });

      it('should build G Major diatonic triads with correct F# spelling', () => {
        const gMajorKey = getKeySignatures(7, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(gMajorKey);

        expect(triads).toHaveLength(7);

        // I - G major
        expect(triads[0].notes).toEqual([7, 11, 2]);
        expect(triads[0].labels).toEqual(['G', 'B', 'D']);

        // ii - A minor
        expect(triads[1].notes).toEqual([9, 0, 4]);
        expect(triads[1].labels).toEqual(['A', 'C', 'E']);

        // iii - B minor
        expect(triads[2].notes).toEqual([11, 2, 6]);
        expect(triads[2].labels).toEqual(['B', 'D', 'F♯']);

        // IV - C major
        expect(triads[3].notes).toEqual([0, 4, 7]);
        expect(triads[3].labels).toEqual(['C', 'E', 'G']);

        // V - D major
        expect(triads[4].notes).toEqual([2, 6, 9]);
        expect(triads[4].labels).toEqual(['D', 'F♯', 'A']);

        // vi - E minor
        expect(triads[5].notes).toEqual([4, 7, 11]);
        expect(triads[5].labels).toEqual(['E', 'G', 'B']);

        // vii° - F# diminished
        expect(triads[6].notes).toEqual([6, 9, 0]);
        expect(triads[6].labels).toEqual(['F♯', 'A', 'C']);
      });

      it('should build F Major diatonic triads with correct Bb spelling', () => {
        const fMajorKey = getKeySignatures(5, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(fMajorKey);

        expect(triads).toHaveLength(7);

        // I - F major
        expect(triads[0].notes).toEqual([5, 9, 0]);
        expect(triads[0].labels).toEqual(['F', 'A', 'C']);

        // ii - G minor
        expect(triads[1].notes).toEqual([7, 10, 2]);
        expect(triads[1].labels).toEqual(['G', 'B♭', 'D']);

        // iii - A minor
        expect(triads[2].notes).toEqual([9, 0, 4]);
        expect(triads[2].labels).toEqual(['A', 'C', 'E']);

        // IV - Bb major
        expect(triads[3].notes).toEqual([10, 2, 5]);
        expect(triads[3].labels).toEqual(['B♭', 'D', 'F']);

        // V - C major
        expect(triads[4].notes).toEqual([0, 4, 7]);
        expect(triads[4].labels).toEqual(['C', 'E', 'G']);

        // vi - D minor
        expect(triads[5].notes).toEqual([2, 5, 9]);
        expect(triads[5].labels).toEqual(['D', 'F', 'A']);

        // vii° - E diminished
        expect(triads[6].notes).toEqual([4, 7, 10]);
        expect(triads[6].labels).toEqual(['E', 'G', 'B♭']);
      });

      it('should build D Major diatonic triads with F# and C# spellings', () => {
        const dMajorKey = getKeySignatures(2, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(dMajorKey);

        expect(triads).toHaveLength(7);

        // I - D major
        expect(triads[0].notes).toEqual([2, 6, 9]);
        expect(triads[0].labels).toEqual(['D', 'F♯', 'A']);

        // ii - E minor
        expect(triads[1].notes).toEqual([4, 7, 11]);
        expect(triads[1].labels).toEqual(['E', 'G', 'B']);

        // iii - F# minor
        expect(triads[2].notes).toEqual([6, 9, 1]);
        expect(triads[2].labels).toEqual(['F♯', 'A', 'C♯']);

        // IV - G major
        expect(triads[3].notes).toEqual([7, 11, 2]);
        expect(triads[3].labels).toEqual(['G', 'B', 'D']);

        // V - A major
        expect(triads[4].notes).toEqual([9, 1, 4]);
        expect(triads[4].labels).toEqual(['A', 'C♯', 'E']);

        // vi - B minor
        expect(triads[5].notes).toEqual([11, 2, 6]);
        expect(triads[5].labels).toEqual(['B', 'D', 'F♯']);

        // vii° - C# diminished
        expect(triads[6].notes).toEqual([1, 4, 7]);
        expect(triads[6].labels).toEqual(['C♯', 'E', 'G']);
      });
    });

    describe('Minor Keys', () => {
      it('should build A Minor diatonic triads correctly', () => {
        const aMinorKey = getKeySignatures(9, TONALITY.MINOR_NATURAL)[0];
        const triads = buildDiatonicTriads(aMinorKey);

        expect(triads).toHaveLength(7);

        // i - A minor
        expect(triads[0].notes).toEqual([9, 0, 4]);
        expect(triads[0].labels).toEqual(['A', 'C', 'E']);

        // ii° - B diminished
        expect(triads[1].notes).toEqual([11, 2, 5]);
        expect(triads[1].labels).toEqual(['B', 'D', 'F']);

        // III - C major
        expect(triads[2].notes).toEqual([0, 4, 7]);
        expect(triads[2].labels).toEqual(['C', 'E', 'G']);

        // iv - D minor
        expect(triads[3].notes).toEqual([2, 5, 9]);
        expect(triads[3].labels).toEqual(['D', 'F', 'A']);

        // v - E minor
        expect(triads[4].notes).toEqual([4, 7, 11]);
        expect(triads[4].labels).toEqual(['E', 'G', 'B']);

        // VI - F major
        expect(triads[5].notes).toEqual([5, 9, 0]);
        expect(triads[5].labels).toEqual(['F', 'A', 'C']);

        // VII - G major
        expect(triads[6].notes).toEqual([7, 11, 2]);
        expect(triads[6].labels).toEqual(['G', 'B', 'D']);
      });

      it('should build E Minor diatonic triads with F# spelling', () => {
        const eMinorKey = getKeySignatures(4, TONALITY.MINOR_NATURAL)[0];
        const triads = buildDiatonicTriads(eMinorKey);

        expect(triads).toHaveLength(7);

        // i - E minor
        expect(triads[0].notes).toEqual([4, 7, 11]);
        expect(triads[0].labels).toEqual(['E', 'G', 'B']);

        // ii° - F# diminished
        expect(triads[1].notes).toEqual([6, 9, 0]);
        expect(triads[1].labels).toEqual(['F♯', 'A', 'C']);

        // III - G major
        expect(triads[2].notes).toEqual([7, 11, 2]);
        expect(triads[2].labels).toEqual(['G', 'B', 'D']);

        // iv - A minor
        expect(triads[3].notes).toEqual([9, 0, 4]);
        expect(triads[3].labels).toEqual(['A', 'C', 'E']);

        // v - B minor
        expect(triads[4].notes).toEqual([11, 2, 6]);
        expect(triads[4].labels).toEqual(['B', 'D', 'F♯']);

        // VI - C major
        expect(triads[5].notes).toEqual([0, 4, 7]);
        expect(triads[5].labels).toEqual(['C', 'E', 'G']);

        // VII - D major
        expect(triads[6].notes).toEqual([2, 6, 9]);
        expect(triads[6].labels).toEqual(['D', 'F♯', 'A']);
      });

      it('should build A Harmonic Minor diatonic triads with G# spelling', () => {
        const aHarmonicMinorKey = getKeySignatures(9, TONALITY.MINOR_HARMONIC)[0];
        const triads = buildDiatonicTriads(aHarmonicMinorKey);

        expect(triads).toHaveLength(7);

        // i - A minor
        expect(triads[0].notes).toEqual([9, 0, 4]);
        expect(triads[0].labels).toEqual(['A', 'C', 'E']);

        // ii° - B diminished
        expect(triads[1].notes).toEqual([11, 2, 5]);
        expect(triads[1].labels).toEqual(['B', 'D', 'F']);

        // III+ - C augmented (characteristic chord)
        expect(triads[2].notes).toEqual([0, 4, 8]);
        expect(triads[2].labels).toEqual(['C', 'E', 'G♯']);

        // iv - D minor
        expect(triads[3].notes).toEqual([2, 5, 9]);
        expect(triads[3].labels).toEqual(['D', 'F', 'A']);

        // V - E major (due to raised 7th)
        expect(triads[4].notes).toEqual([4, 8, 11]);
        expect(triads[4].labels).toEqual(['E', 'G♯', 'B']);

        // VI - F major
        expect(triads[5].notes).toEqual([5, 9, 0]);
        expect(triads[5].labels).toEqual(['F', 'A', 'C']);

        // vii° - G# diminished
        expect(triads[6].notes).toEqual([8, 11, 2]);
        expect(triads[6].labels).toEqual(['G♯', 'B', 'D']);
      });

      it('should build E Harmonic Minor diatonic triads with D# spelling', () => {
        const eHarmonicMinorKey = getKeySignatures(4, TONALITY.MINOR_HARMONIC)[0];
        const triads = buildDiatonicTriads(eHarmonicMinorKey);

        expect(triads).toHaveLength(7);

        // i - E minor
        expect(triads[0].notes).toEqual([4, 7, 11]);
        expect(triads[0].labels).toEqual(['E', 'G', 'B']);

        // ii° - F# diminished
        expect(triads[1].notes).toEqual([6, 9, 0]);
        expect(triads[1].labels).toEqual(['F♯', 'A', 'C']);

        // III+ - G augmented
        expect(triads[2].notes).toEqual([7, 11, 3]);
        expect(triads[2].labels).toEqual(['G', 'B', 'D♯']);

        // iv - A minor
        expect(triads[3].notes).toEqual([9, 0, 4]);
        expect(triads[3].labels).toEqual(['A', 'C', 'E']);

        // V - B major (due to raised 7th)
        expect(triads[4].notes).toEqual([11, 3, 6]);
        expect(triads[4].labels).toEqual(['B', 'D♯', 'F♯']);

        // VI - C major
        expect(triads[5].notes).toEqual([0, 4, 7]);
        expect(triads[5].labels).toEqual(['C', 'E', 'G']);

        // vii° - D# diminished
        expect(triads[6].notes).toEqual([3, 6, 9]);
        expect(triads[6].labels).toEqual(['D♯', 'F♯', 'A']);
      });

      it('should build A Melodic Minor diatonic triads with F# and G# spellings', () => {
        const aMelodicMinorKey = getKeySignatures(9, TONALITY.MINOR_MELODIC)[0];
        const triads = buildDiatonicTriads(aMelodicMinorKey);

        expect(triads).toHaveLength(7);

        // i - A minor
        expect(triads[0].notes).toEqual([9, 0, 4]);
        expect(triads[0].labels).toEqual(['A', 'C', 'E']);

        // ii - B minor
        expect(triads[1].notes).toEqual([11, 2, 6]);
        expect(triads[1].labels).toEqual(['B', 'D', 'F♯']);

        // III+ - C augmented
        expect(triads[2].notes).toEqual([0, 4, 8]);
        expect(triads[2].labels).toEqual(['C', 'E', 'G♯']);

        // IV - D major
        expect(triads[3].notes).toEqual([2, 6, 9]);
        expect(triads[3].labels).toEqual(['D', 'F♯', 'A']);

        // V - E major
        expect(triads[4].notes).toEqual([4, 8, 11]);
        expect(triads[4].labels).toEqual(['E', 'G♯', 'B']);

        // vi° - F# diminished
        expect(triads[5].notes).toEqual([6, 9, 0]);
        expect(triads[5].labels).toEqual(['F♯', 'A', 'C']);

        // vii° - G# diminished
        expect(triads[6].notes).toEqual([8, 11, 2]);
        expect(triads[6].labels).toEqual(['G♯', 'B', 'D']);
      });
    });

    describe('Enharmonic Keys', () => {
      it('should build F# Major diatonic triads with sharp spellings', () => {
        const fsMajorKey = getKeySignatures(6, TONALITY.MAJOR)
          .find((k) => k.accidentalType === 'SHARP')!;
        const triads = buildDiatonicTriads(fsMajorKey);

        expect(triads).toHaveLength(7);

        // I - F# major
        expect(triads[0].notes).toEqual([6, 10, 1]);
        expect(triads[0].labels).toEqual(['F♯', 'A♯', 'C♯']);

        // ii - G# minor
        expect(triads[1].notes).toEqual([8, 11, 3]);
        expect(triads[1].labels).toEqual(['G♯', 'B', 'D♯']);

        // iii - A# minor
        expect(triads[2].notes).toEqual([10, 1, 5]);
        expect(triads[2].labels).toEqual(['A♯', 'C♯', 'E♯']);

        // IV - B major
        expect(triads[3].notes).toEqual([11, 3, 6]);
        expect(triads[3].labels).toEqual(['B', 'D♯', 'F♯']);

        // V - C# major
        expect(triads[4].notes).toEqual([1, 5, 8]);
        expect(triads[4].labels).toEqual(['C♯', 'E♯', 'G♯']);

        // vi - D# minor
        expect(triads[5].notes).toEqual([3, 6, 10]);
        expect(triads[5].labels).toEqual(['D♯', 'F♯', 'A♯']);

        // vii° - E# diminished
        expect(triads[6].notes).toEqual([5, 8, 11]);
        expect(triads[6].labels).toEqual(['E♯', 'G♯', 'B']);
      });

      it('should build Gb Major diatonic triads with flat spellings', () => {
        const gbMajorKey = getKeySignatures(6, TONALITY.MAJOR)
          .find((k) => k.accidentalType === 'FLAT')!;
        const triads = buildDiatonicTriads(gbMajorKey);

        expect(triads).toHaveLength(7);

        // I - Gb major
        expect(triads[0].notes).toEqual([6, 10, 1]);
        expect(triads[0].labels).toEqual(['G♭', 'B♭', 'D♭']);

        // ii - Ab minor
        expect(triads[1].notes).toEqual([8, 11, 3]);
        expect(triads[1].labels).toEqual(['A♭', 'C♭', 'E♭']);

        // iii - Bb minor
        expect(triads[2].notes).toEqual([10, 1, 5]);
        expect(triads[2].labels).toEqual(['B♭', 'D♭', 'F']);

        // IV - Cb major
        expect(triads[3].notes).toEqual([11, 3, 6]);
        expect(triads[3].labels).toEqual(['C♭', 'E♭', 'G♭']);

        // V - Db major
        expect(triads[4].notes).toEqual([1, 5, 8]);
        expect(triads[4].labels).toEqual(['D♭', 'F', 'A♭']);

        // vi - Eb minor
        expect(triads[5].notes).toEqual([3, 6, 10]);
        expect(triads[5].labels).toEqual(['E♭', 'G♭', 'B♭']);

        // vii° - F diminished
        expect(triads[6].notes).toEqual([5, 8, 11]);
        expect(triads[6].labels).toEqual(['F', 'A♭', 'C♭']);
      });
    });

    describe('General Properties', () => {
      it('should always return exactly 7 triads', () => {
        for (let tonic = 0; tonic < 12; tonic++) {
          Object.values(TONALITY).forEach((tonality) => {
            const keys = getKeySignatures(tonic as Note, tonality);
            keys.forEach((key) => {
              const triads = buildDiatonicTriads(key);
              expect(triads).toHaveLength(7);
            });
          });
        }
      });

      it('should return valid Sequence objects', () => {
        const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(cMajorKey);

        triads.forEach((triad) => {
          expect(triad.notes).toBeValidChord();
          expect(triad.labels).toHaveLength(3);
          expect(triad.notes).toHaveLength(3);

          triad.notes.forEach((note) => {
            expect(note).toBeValidNote();
          });

          triad.labels.forEach((label) => {
            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
          });
        });
      });

      it('should use consistent spelling within each key', () => {
        const dMajorKey = getKeySignatures(2, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(dMajorKey);

        // All triads should use sharp spelling (F#, C#) not flat (Gb, Db)
        const allLabels = triads.flatMap((triad) => triad.labels);
        const hasSharp = allLabels.some((label) => label.includes('♯'));
        const hasFlat = allLabels.some((label) => label.includes('♭'));

        expect(hasSharp).toBe(true);
        expect(hasFlat).toBe(false);
      });

      it('should handle all tonalities correctly', () => {
        const testTonic = 0; // C

        Object.values(TONALITY).forEach((tonality) => {
          const keys = getKeySignatures(testTonic as Note, tonality);
          keys.forEach((key) => {
            expect(() => {
              buildDiatonicTriads(key);
            }).not.toThrow();
          });
        });
      });

      it('should build triads with correct chord qualities', () => {
        const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(cMajorKey);

        // Check interval patterns to verify chord qualities
        // Major chord: root + 4 + 7 semitones
        // Minor chord: root + 3 + 7 semitones
        // Diminished chord: root + 3 + 6 semitones

        const chordQualities = triads.map((triad) => {
          const [root, third, fifth] = triad.notes;
          const thirdInterval = (third - root + 12) % 12;
          const fifthInterval = (fifth - root + 12) % 12;

          if (thirdInterval === 4 && fifthInterval === 7) return 'major';
          if (thirdInterval === 3 && fifthInterval === 7) return 'minor';
          if (thirdInterval === 3 && fifthInterval === 6) return 'diminished';
          if (thirdInterval === 4 && fifthInterval === 8) return 'augmented';
          return 'unknown';
        });

        // C Major: I ii iii IV V vi vii°
        expect(chordQualities).toEqual([
          'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
        ]);
      });

      it('should maintain root relationships with scale degrees', () => {
        const gMajorKey = getKeySignatures(7, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(gMajorKey);

        // Each triad's root should match the corresponding scale degree
        triads.forEach((triad, index) => {
          expect(triad.notes[0]).toBe(gMajorKey.scaleAscending.notes[index]);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle chromatic alterations in harmonic minor', () => {
        const aHarmonicMinorKey = getKeySignatures(9, TONALITY.MINOR_HARMONIC)[0];
        const triads = buildDiatonicTriads(aHarmonicMinorKey);

        // The III+ chord should contain G# (raised 7th)
        const thirdChord = triads[2]; // III+ (C augmented)
        expect(thirdChord.notes).toEqual([0, 4, 8]);
        expect(thirdChord.labels).toEqual(['C', 'E', 'G♯']);
      });

      it('should handle complex enharmonic relationships', () => {
        const csMajorKey = getKeySignatures(1, TONALITY.MAJOR)
          .find((k) => k.accidentalType === 'SHARP')!;
        const triads = buildDiatonicTriads(csMajorKey);

        // Should use sharp spellings throughout
        const allLabels = triads.flatMap((triad) => triad.labels);
        const hasSharp = allLabels.some((label) => label.includes('♯'));
        const hasFlat = allLabels.some((label) => label.includes('♭'));

        expect(hasSharp).toBe(true);
        expect(hasFlat).toBe(false);
      });

      it('should be consistent with key signature spelling', () => {
        const ebMajorKey = getKeySignatures(3, TONALITY.MAJOR)[0];
        const triads = buildDiatonicTriads(ebMajorKey);

        // Should use flat spellings consistent with Eb major
        const allLabels = triads.flatMap((triad) => triad.labels);
        const hasFlat = allLabels.some((label) => label.includes('♭'));

        expect(hasFlat).toBe(true);
      });
    });
  });
});
