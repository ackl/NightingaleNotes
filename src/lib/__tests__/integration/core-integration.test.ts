import { describe, expect, it } from 'vitest';
import { buildChord, CHORD_TYPE_ENUM, majorScaleChordTypes } from '../../core/chords';
import type { Note } from '../../core/primitives';
import { notes } from '../../core/primitives';
import { TONALITY, buildScale } from '../../core/scales';
import { getKeySignatures } from '../../key-signatures/calculator';
import { buildDiatonicTriads } from '../../key-signatures/analysis';
import { tonalityDiatonicChordsMap } from '../../theory/roman-numerals';
import {
  assertChordQuality,
} from '../helpers/music-theory-helpers';

describe('Core Integration Tests', () => {
  describe('Scale and Chord Integration', () => {
    it('should build chords that fit within their key signature scales', () => {
      // Test all major scales
      notes.forEach((tonic) => {
        const majorScale = buildScale(tonic, TONALITY.MAJOR);

        // Build I chord in this key
        const tonicChord = buildChord(tonic, CHORD_TYPE_ENUM.MAJOR);

        // All chord tones should be in the scale
        tonicChord.forEach((note) => {
          expect(majorScale).toContain(note);
        });
      });
    });

    it('should maintain consistent chord qualities across scales', () => {
      // Test that diatonic chords have consistent qualities in all major keys
      notes.forEach((tonic) => {
        const majorScale = buildScale(tonic, TONALITY.MAJOR);

        // Build all diatonic chords
        const diatonicChords = majorScale.map((scaleNote, index) => {
          const majorChordTypes = majorScaleChordTypes;
          return buildChord(scaleNote, majorChordTypes[index]);
        });

        // Check chord qualities
        assertChordQuality(diatonicChords[0], 'M'); // I
        assertChordQuality(diatonicChords[1], 'm'); // ii
        assertChordQuality(diatonicChords[2], 'm'); // iii
        assertChordQuality(diatonicChords[3], 'M'); // IV
        assertChordQuality(diatonicChords[4], 'M'); // V
        assertChordQuality(diatonicChords[5], 'm'); // vi
        assertChordQuality(diatonicChords[6], 'd'); // vii°
      });
    });
  });

  describe('Key Signature and Analysis Integration', () => {
    it('should generate consistent diatonic triads across all systems', () => {
      // Test major keys
      notes.forEach((tonic) => {
        const keySignatures = getKeySignatures(tonic, TONALITY.MAJOR);
        const keySignature = keySignatures[0];

        // Get triads from analysis system
        const triads = buildDiatonicTriads(keySignature);

        // Get chord types from Roman numeral system
        const { chordTypes, romanNumerals } = tonalityDiatonicChordsMap[TONALITY.MAJOR];

        // Should have 7 triads
        expect(triads).toHaveLength(7);
        expect(chordTypes).toHaveLength(7);
        expect(romanNumerals).toHaveLength(7);

        // Each triad should be valid
        triads.forEach((triad) => {
          expect(triad.notes).toBeValidTriad();
          expect(triad.labels).toHaveLength(3);
        });

        // Chord types should correspond to Roman numerals
        chordTypes.forEach((chordType, index) => {
          const romanNumeral = romanNumerals[index];

          if (chordType === 'M') {
            expect(romanNumeral).toMatch(/^[IVX]+$/); // Uppercase
          } else if (chordType === 'm') {
            expect(romanNumeral).toMatch(/^[ivx]+$/); // Lowercase
          } else if (chordType === 'd') {
            expect(romanNumeral).toContain('°'); // Diminished symbol
          }
        });
      });
    });

    it('should handle enharmonic key signatures correctly', () => {
      // Test enharmonic keys (F# Major vs Gb Major)
      const fSharpMajor = getKeySignatures(6, TONALITY.MAJOR)
        .find((k) => k.accidentalType === 'SHARP');
      const gFlatMajor = getKeySignatures(6, TONALITY.MAJOR)
        .find((k) => k.accidentalType === 'FLAT');

      expect(fSharpMajor).toBeDefined();
      expect(gFlatMajor).toBeDefined();

      // Both should have the same note structure
      expect(fSharpMajor!.scaleAscending.notes).toEqual(gFlatMajor!.scaleAscending.notes);

      // But different labeling
      expect(fSharpMajor!.scaleAscending.labels).not.toEqual(gFlatMajor!.scaleAscending.labels);

      // Sharp key should use sharp labels
      const sharpLabels = fSharpMajor!.scaleAscending.labels.join('');
      expect(sharpLabels).toContain('♯');
      expect(sharpLabels).not.toContain('♭');

      // Flat key should use flat labels
      const flatLabels = gFlatMajor!.scaleAscending.labels.join('');
      expect(flatLabels).toContain('♭');
      expect(flatLabels).not.toContain('♯');
    });

    it('should generate consistent triads with proper labeling', () => {
      // Test that triads use consistent labeling with their key signature
      const dMajorKey = getKeySignatures(2, TONALITY.MAJOR)[0];
      const triads = buildDiatonicTriads(dMajorKey);

      // All labels should use sharp notation (D Major has F# and C#)
      const allLabels = triads.flatMap((triad) => triad.labels).join('');
      expect(allLabels).toContain('♯');
      expect(allLabels).not.toContain('♭');

      // Check specific expected labels
      const fSharpMinorTriad = triads[2]; // iii chord
      expect(fSharpMinorTriad.labels).toContain('F♯');
      expect(fSharpMinorTriad.labels).toContain('C♯');
    });
  });

  describe('Cross-System Validation', () => {
    it('should maintain consistency between scales and key signatures', () => {
      Object.values(TONALITY).forEach((tonality) => {
        notes.forEach((tonic) => {
          // Build scale using scale system
          const scale = buildScale(tonic, tonality);

          // Get key signatures using key signature system
          const keySignatures = getKeySignatures(tonic, tonality);

          // Should have at least one key signature
          expect(keySignatures.length).toBeGreaterThan(0);

          // First key signature should match the scale
          const keySignature = keySignatures[0];
          expect(keySignature.scaleAscending.notes).toEqual(scale);

          // Scale should be valid
          expect(scale).toBeValidScale();
          expect(keySignature.scaleAscending.notes).toBeValidScale();
        });
      });
    });

    it('should handle all tonalities consistently', () => {
      const testTonic = 0; // C

      Object.values(TONALITY).forEach((tonality) => {
        // Build scale
        const scale = buildScale(testTonic, tonality);

        // Get key signature
        const keySignatures = getKeySignatures(testTonic, tonality);
        const keySignature = keySignatures[0];

        // Get chord types and Roman numerals
        const { chordTypes, romanNumerals } = tonalityDiatonicChordsMap[tonality];

        // Build diatonic triads
        const triads = buildDiatonicTriads(keySignature);

        // All should have 7 elements
        expect(scale).toHaveLength(7);
        expect(chordTypes).toHaveLength(7);
        expect(romanNumerals).toHaveLength(7);
        expect(triads).toHaveLength(7);

        // Each triad should match its chord type
        triads.forEach((triad, index) => {
          const chordType = chordTypes[index];

          if (chordType === 'M') {
            assertChordQuality(triad.notes, 'M');
          } else if (chordType === 'm') {
            assertChordQuality(triad.notes, 'm');
          } else if (chordType === 'd') {
            assertChordQuality(triad.notes, 'd');
          } else if (chordType === '+') {
            assertChordQuality(triad.notes, '+');
          }
        });
      });
    });
  });

  describe('Musical Theory Validation', () => {
    it('should respect circle of fifths relationships', () => {
      // Test that keys a fifth apart have the expected accidental difference
      const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
      const gMajorKey = getKeySignatures(7, TONALITY.MAJOR)[0];

      // G Major should have one more sharp than C Major
      expect(gMajorKey.accidentals.length).toBe(cMajorKey.accidentals.length + 1);

      // Test flat direction
      const fMajorKey = getKeySignatures(5, TONALITY.MAJOR)[0];

      // F Major should have one flat
      expect(fMajorKey.accidentals.length).toBe(1);
      expect(fMajorKey.accidentalType).toBe('FLAT');
    });

    it('should maintain relative major/minor relationships', () => {
      // Test that relative keys share the same accidentals
      const cMajorKey = getKeySignatures(0, TONALITY.MAJOR)[0];
      const aMinorKey = getKeySignatures(9, TONALITY.MINOR_NATURAL)[0];

      // Should have same accidentals (both should be natural)
      expect(cMajorKey.accidentals).toEqual(aMinorKey.accidentals);
      expect(cMajorKey.accidentalType).toBe(aMinorKey.accidentalType);

      // Test with accidentals
      const gMajorKey = getKeySignatures(7, TONALITY.MAJOR)[0];
      const eMinorKey = getKeySignatures(4, TONALITY.MINOR_NATURAL)[0];

      // Both should have F#
      expect(gMajorKey.accidentals).toEqual(eMinorKey.accidentals);
      expect(gMajorKey.accidentalType).toBe(eMinorKey.accidentalType);
    });

    it('should handle chromatic alterations in minor scales', () => {
      // Test harmonic minor
      const aHarmonicMinorKey = getKeySignatures(9, TONALITY.MINOR_HARMONIC)[0];
      const harmonicTriads = buildDiatonicTriads(aHarmonicMinorKey);

      // Should have the characteristic augmented III chord
      const augmentedChord = harmonicTriads[2]; // III+
      assertChordQuality(augmentedChord.notes, '+');

      // Should have major V chord
      const majorVChord = harmonicTriads[4]; // V
      assertChordQuality(majorVChord.notes, 'M');

      // Test melodic minor
      const aMelodicMinorKey = getKeySignatures(9, TONALITY.MINOR_MELODIC)[0];
      const melodicTriads = buildDiatonicTriads(aMelodicMinorKey);

      // Should have major IV chord
      const majorIVChord = melodicTriads[3]; // IV
      assertChordQuality(majorIVChord.notes, 'M');

      // Should have major V chord
      const majorVChord2 = melodicTriads[4]; // V
      assertChordQuality(majorVChord2.notes, 'M');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle all possible tonic and tonality combinations', () => {
      // Test every combination without errors
      notes.forEach((tonic) => {
        Object.values(TONALITY).forEach((tonality) => {
          expect(() => {
            const scale = buildScale(tonic, tonality);
            const keySignatures = getKeySignatures(tonic, tonality);
            const { chordTypes, romanNumerals } = tonalityDiatonicChordsMap[tonality];

            // Basic validation
            expect(scale).toHaveLength(7);
            expect(keySignatures.length).toBeGreaterThan(0);
            expect(chordTypes).toHaveLength(7);
            expect(romanNumerals).toHaveLength(7);
          }).not.toThrow();
        });
      });
    });

    it('should handle extreme chord constructions', () => {
      // Test all chord types with all possible roots
      notes.forEach((root) => {
        Object.values(CHORD_TYPE_ENUM).forEach((chordType) => {
          expect(() => {
            const chord = buildChord(root, chordType);
            expect(chord.length).toBeGreaterThan(0);
            expect(chord.every((note) => typeof note === 'number')).toBe(true);
          }).not.toThrow();
        });
      });
    });

    it('should maintain performance with large-scale operations', () => {
      // Test that operations complete in reasonable time
      const startTime = performance.now();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const tonic = i % 12 as Note;
        const tonality = Object.values(TONALITY)[i % Object.values(TONALITY).length];

        buildScale(tonic, tonality);
        getKeySignatures(tonic, tonality);
        // eslint-disable-next-line
        const _ = tonalityDiatonicChordsMap[tonality];
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (adjust as needed)
      expect(totalTime).toBeLessThan(300); // .3 s
    });
  });

  describe('Data Consistency Validation', () => {
    it('should maintain consistent data structures across all systems', () => {
      const testTonic = 0;
      const testTonality = TONALITY.MAJOR;

      // Get data from all systems
      const scale = buildScale(testTonic, testTonality);
      const keySignatures = getKeySignatures(testTonic, testTonality);
      const { chordTypes, romanNumerals } = tonalityDiatonicChordsMap[testTonality];

      // All should have consistent structure
      expect(scale).toHaveLength(7);
      expect(keySignatures[0].scaleAscending.notes).toHaveLength(7);
      expect(keySignatures[0].scaleAscending.labels).toHaveLength(7);
      expect(chordTypes).toHaveLength(7);
      expect(romanNumerals).toHaveLength(7);

      // Labels should be strings
      keySignatures[0].scaleAscending.labels.forEach((label) => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });

      // Roman numerals should be strings
      romanNumerals.forEach((numeral) => {
        expect(typeof numeral).toBe('string');
        expect(numeral.length).toBeGreaterThan(0);
      });
    });
  });
});
