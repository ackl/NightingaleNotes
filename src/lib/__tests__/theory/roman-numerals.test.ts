import { describe, expect, it } from 'vitest';
import { tonalityDiatonicChordsMap } from '../../theory/roman-numerals';
import { TONALITY } from '../../core/scales';

describe('Roman Numerals', () => {
  describe('getDiatonicChordTypes', () => {
    describe('All Tonalities should be handled', () => {
      it('should return exactly 7 chord types for all tonalities', () => {
        Object.values(TONALITY).forEach((tonality) => {
          const tonalityDiatonicChords = tonalityDiatonicChordsMap[tonality];
          const { chordTypes } = tonalityDiatonicChords;
          expect(chordTypes).toHaveLength(7);
        });
      });
    });
  });

  describe('getDiatonicChordRomanNumerals', () => {
    describe('Major Scale', () => {
      const tonalityDiatonicChords = tonalityDiatonicChordsMap[TONALITY.MAJOR];
      const { romanNumerals } = tonalityDiatonicChords;

      it('should return correct Roman numerals for major scale', () => {
        expect(romanNumerals).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
      });

      it('should return exactly 7 Roman numerals', () => {
        expect(romanNumerals).toHaveLength(7);
      });

      it('should use uppercase for major chords', () => {
        // I, IV, V should be uppercase (major chords)
        expect(romanNumerals[0]).toBe('I');
        expect(romanNumerals[3]).toBe('IV');
        expect(romanNumerals[4]).toBe('V');
      });

      it('should use lowercase for minor chords', () => {
        // ii, iii, vi should be lowercase (minor chords)
        expect(romanNumerals[1]).toBe('ii');
        expect(romanNumerals[2]).toBe('iii');
        expect(romanNumerals[5]).toBe('vi');
      });

      it('should include diminished symbol for vii°', () => {
        expect(romanNumerals[6]).toBe('vii°');
      });
    });

    describe('Natural Minor Scale', () => {
      const tonalityDiatonicChords = tonalityDiatonicChordsMap[TONALITY.MINOR_NATURAL];
      const { romanNumerals } = tonalityDiatonicChords;

      it('should return correct Roman numerals for natural minor scale', () => {
        expect(romanNumerals).toEqual(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
      });

      it('should return exactly 7 Roman numerals', () => {
        expect(romanNumerals).toHaveLength(7);
      });

      it('should use lowercase for minor chords', () => {
        // i, iv, v should be lowercase (minor chords)
        expect(romanNumerals[0]).toBe('i');
        expect(romanNumerals[3]).toBe('iv');
        expect(romanNumerals[4]).toBe('v');
      });

      it('should use uppercase for major chords', () => {
        // III, VI, VII should be uppercase (major chords)
        expect(romanNumerals[2]).toBe('III');
        expect(romanNumerals[5]).toBe('VI');
        expect(romanNumerals[6]).toBe('VII');
      });

      it('should include diminished symbol for ii°', () => {
        expect(romanNumerals[1]).toBe('ii°');
      });
    });

    describe('Harmonic Minor Scale', () => {
      const tonalityDiatonicChords = tonalityDiatonicChordsMap[TONALITY.MINOR_HARMONIC];
      const { romanNumerals } = tonalityDiatonicChords;

      it('should return correct Roman numerals for harmonic minor scale', () => {
        expect(romanNumerals).toEqual(['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']);
      });

      it('should return exactly 7 Roman numerals', () => {
        expect(romanNumerals).toHaveLength(7);
      });

      it('should include augmented symbol for III+', () => {
        expect(romanNumerals[2]).toBe('III+');
      });

      it('should have major V chord', () => {
        expect(romanNumerals[4]).toBe('V');
      });

      it('should include diminished symbols for ii° and vii°', () => {
        expect(romanNumerals[1]).toBe('ii°');
        expect(romanNumerals[6]).toBe('vii°');
      });
    });

    describe('Melodic Minor Scale', () => {
      const tonalityDiatonicChords = tonalityDiatonicChordsMap[TONALITY.MINOR_MELODIC];
      const { romanNumerals } = tonalityDiatonicChords;

      it('should return correct Roman numerals for melodic minor scale', () => {
        expect(romanNumerals).toEqual(['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°']);
      });

      it('should return exactly 7 Roman numerals', () => {
        expect(romanNumerals).toHaveLength(7);
      });

      it('should have major IV and V chords', () => {
        expect(romanNumerals[3]).toBe('IV');
        expect(romanNumerals[4]).toBe('V');
      });

      it('should include augmented symbol for III+', () => {
        expect(romanNumerals[2]).toBe('III+');
      });

      it('should include diminished symbols for vi° and vii°', () => {
        expect(romanNumerals[5]).toBe('vi°');
        expect(romanNumerals[6]).toBe('vii°');
      });
    });

    describe('All Tonalities', () => {
      it('should return exactly 7 Roman numerals for all tonalities', () => {
        Object.values(TONALITY).forEach((tonality) => {
          const tonalityDiatonicChords = tonalityDiatonicChordsMap[tonality];
          const { romanNumerals } = tonalityDiatonicChords;
          expect(romanNumerals).toHaveLength(7);
        });
      });

      it('should return valid Roman numeral strings', () => {
        Object.values(TONALITY).forEach((tonality) => {
          const tonalityDiatonicChords = tonalityDiatonicChordsMap[tonality];
          const { romanNumerals } = tonalityDiatonicChords;
          romanNumerals.forEach((numeral) => {
            expect(typeof numeral).toBe('string');
            expect(numeral.length).toBeGreaterThan(0);
            // Should contain at least one Roman numeral character
            expect(numeral).toMatch(/[ivxlcdm]/i);
          });
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should have consistent chord types and Roman numerals', () => {
      Object.values(TONALITY).forEach((tonality) => {
        const tonalityDiatonicChords = tonalityDiatonicChordsMap[tonality];
        const { chordTypes, romanNumerals } = tonalityDiatonicChords;

        expect(chordTypes).toHaveLength(romanNumerals.length);

        // Check that major chord types correspond to uppercase Roman numerals
        chordTypes.forEach((chordType, index) => {
          const numeral = romanNumerals[index];

          if (chordType === 'M') {
            // Major chords should have uppercase Roman numerals
            expect(numeral).toMatch(/^[IVX]+$/);
          } else if (chordType === 'm') {
            // Minor chords should have lowercase Roman numerals
            expect(numeral).toMatch(/^[ivx]+$/);
          } else if (chordType === 'd') {
            // Diminished chords should have ° symbol
            expect(numeral).toContain('°');
          } else if (chordType === '+') {
            // Augmented chords should have + symbol
            expect(numeral).toContain('+');
          }
        });
      });
    });

    it('should maintain relationships between different minor scales', () => {
      // Natural minor should be the relative minor pattern
      const major = tonalityDiatonicChordsMap[TONALITY.MAJOR].chordTypes;
      const naturalMinor = tonalityDiatonicChordsMap[TONALITY.MINOR_NATURAL].chordTypes;

      // Natural minor should be major scale starting from 6th degree
      expect(naturalMinor).toEqual([
        major[5], // vi -> i
        major[6], // vii° -> ii°
        major[0], // I -> III
        major[1], // ii -> iv
        major[2], // iii -> v
        major[3], // IV -> VI
        major[4], // V -> VII
      ]);
    });

    it('should handle chord quality symbols consistently', () => {
      const harmonicMinor = tonalityDiatonicChordsMap[TONALITY.MINOR_HARMONIC].romanNumerals;
      const melodicMinor = tonalityDiatonicChordsMap[TONALITY.MINOR_MELODIC].romanNumerals;

      // Both should have III+ augmented chord
      expect(harmonicMinor[2]).toBe('III+');
      expect(melodicMinor[2]).toBe('III+');

      // Both should have major V chord
      expect(harmonicMinor[4]).toBe('V');
      expect(melodicMinor[4]).toBe('V');
    });
  });
});
