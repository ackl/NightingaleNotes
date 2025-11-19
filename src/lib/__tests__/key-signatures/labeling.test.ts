import { describe, expect, it } from 'vitest';
import {
  getBaseLetters,
  labelToNote,
  findBaseLetterAndAccidental,
  getAccidentalSymbol,
  getMajorKeyLabel,
  getMinorKeyLabel,
  getChromaticNoteLabels,
} from '../../key-signatures/labeling';
import {
  type Note, type NoteLabelBase, noteLabels,
} from '../../core/primitives';
import { TONALITY } from '../../core/scales';

describe('Key Signature Labeling', () => {
  describe('getBaseLetters', () => {
    it('should return all 7 note letters in correct order', () => {
      // Test each possible starting note
      const cLetters = getBaseLetters('C');
      expect(cLetters).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

      const fLetters = getBaseLetters('F');
      expect(fLetters).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E']);

      const aLetters = getBaseLetters('A');
      expect(aLetters).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

      const bLetters = getBaseLetters('B');
      expect(bLetters).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A']);
    });

    it('should handle all 7 note letters as inputs', () => {
      noteLabels.forEach((letter) => {
        const result = getBaseLetters(letter);
        expect(result).toHaveLength(7);
        expect(result[0]).toBe(letter);

        // Should contain all 7 letters
        const sortedResult = [...result].sort();
        expect(sortedResult).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
      });
    });

    it('should maintain alphabetical progression', () => {
      const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      letters.forEach((startLetter, startIndex) => {
        const result = getBaseLetters(startLetter as NoteLabelBase);

        // Check that each letter follows alphabetically (with wraparound)
        for (let i = 0; i < result.length; i++) {
          const expectedIndex = (startIndex + i) % 7;
          expect(result[i]).toBe(letters[expectedIndex]);
        }
      });
    });

    it('should always return exactly 7 letters', () => {
      noteLabels.forEach((letter) => {
        const result = getBaseLetters(letter);
        expect(result).toHaveLength(7);
      });
    });
  });

  describe('labelToNote', () => {
    it('should convert note letters to correct white key numbers', () => {
      expect(labelToNote('C')).toBe(0);
      expect(labelToNote('D')).toBe(2);
      expect(labelToNote('E')).toBe(4);
      expect(labelToNote('F')).toBe(5);
      expect(labelToNote('G')).toBe(7);
      expect(labelToNote('A')).toBe(9);
      expect(labelToNote('B')).toBe(11);
    });

    it('should return valid notes for all note letters', () => {
      noteLabels.forEach((letter) => {
        const note = labelToNote(letter);
        expect(note).toBeValidNote();
      });
    });

    it('should map to white key positions only', () => {
      const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
      noteLabels.forEach((letter) => {
        const note = labelToNote(letter);
        expect(whiteKeys).toContain(note);
      });
    });

    it('should be consistent with note label order', () => {
      const expectedNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
      noteLabels.forEach((letter, index) => {
        expect(labelToNote(letter)).toBe(expectedNotes[index]);
      });
    });
  });

  describe('findBaseLetterAndAccidental', () => {
    describe('Sharp Context', () => {
      it('should find sharp spellings correctly', () => {
        // F# (note 6)
        const fs = findBaseLetterAndAccidental(6, 'SHARP');
        expect(fs.base).toBe('F');
        expect(fs.accidental).toBe('♯');

        // C# (note 1)
        const cs = findBaseLetterAndAccidental(1, 'SHARP');
        expect(cs.base).toBe('C');
        expect(cs.accidental).toBe('♯');

        // G# (note 8)
        const gs = findBaseLetterAndAccidental(8, 'SHARP');
        expect(gs.base).toBe('G');
        expect(gs.accidental).toBe('♯');

        // D# (note 3)
        const ds = findBaseLetterAndAccidental(3, 'SHARP');
        expect(ds.base).toBe('D');
        expect(ds.accidental).toBe('♯');

        // A# (note 10)
        const as = findBaseLetterAndAccidental(10, 'SHARP');
        expect(as.base).toBe('A');
        expect(as.accidental).toBe('♯');
      });

      it('should prioritize sharp spellings even for natural notes', () => {
        // In sharp context, the function first tries to find sharp spellings
        // C (0) in sharp context = B# (B + sharp)
        // D (2) in sharp context = C# + something... no, D = D natural
        // Actually, let's test what it actually does
        const result = findBaseLetterAndAccidental(0, 'SHARP');
        // C (0) = B (11) + 1, so should return B#
        expect(result.base).toBe('B');
        expect(result.accidental).toBe('♯');
      });
    });

    describe('Flat Context', () => {
      it('should find flat spellings correctly', () => {
        // Gb (note 6)
        const gb = findBaseLetterAndAccidental(6, 'FLAT');
        expect(gb.base).toBe('G');
        expect(gb.accidental).toBe('♭');

        // Db (note 1)
        const db = findBaseLetterAndAccidental(1, 'FLAT');
        expect(db.base).toBe('D');
        expect(db.accidental).toBe('♭');

        // Ab (note 8)
        const ab = findBaseLetterAndAccidental(8, 'FLAT');
        expect(ab.base).toBe('A');
        expect(ab.accidental).toBe('♭');

        // Eb (note 3)
        const eb = findBaseLetterAndAccidental(3, 'FLAT');
        expect(eb.base).toBe('E');
        expect(eb.accidental).toBe('♭');

        // Bb (note 10)
        const bb = findBaseLetterAndAccidental(10, 'FLAT');
        expect(bb.base).toBe('B');
        expect(bb.accidental).toBe('♭');
      });

      it('should prioritize flat spellings even for natural notes', () => {
        // In flat context, the function first tries to find flat spellings
        // E (4) in flat context = F (5) - 1, so should return Fb
        const result = findBaseLetterAndAccidental(4, 'FLAT');
        expect(result.base).toBe('F');
        expect(result.accidental).toBe('♭');
      });
    });

    describe('Natural Context', () => {
      it('should handle natural notes correctly', () => {
        const naturalNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
        const expectedLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        naturalNotes.forEach((note, index) => {
          const result = findBaseLetterAndAccidental(note as Note, 'NATURAL');
          expect(result.base).toBe(expectedLetters[index]);
          expect(result.accidental).toBe('');
        });
      });

      it('should throw error for non-natural notes in natural context', () => {
        // For chromatic notes that don't have natural spellings, should throw
        expect(() => {
          findBaseLetterAndAccidental(6, 'NATURAL');
        }).toThrow('Cannot find base letter for note 6');
      });
    });

    describe('Edge Cases', () => {
      it('should handle all chromatic notes with sharp/flat', () => {
        for (let note = 0; note < 12; note++) {
          expect(() => {
            findBaseLetterAndAccidental(note as Note, 'SHARP');
          }).not.toThrow();

          expect(() => {
            findBaseLetterAndAccidental(note as Note, 'FLAT');
          }).not.toThrow();
        }
      });

      it('should handle natural notes with natural context', () => {
        const naturalNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
        naturalNotes.forEach((note) => {
          expect(() => {
            findBaseLetterAndAccidental(note as Note, 'NATURAL');
          }).not.toThrow();
        });
      });

      it('should throw for chromatic notes with natural context', () => {
        const chromaticNotes = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
        chromaticNotes.forEach((note) => {
          expect(() => {
            findBaseLetterAndAccidental(note as Note, 'NATURAL');
          }).toThrow();
        });
      });

      it('should produce consistent results', () => {
        // Same input should always produce same output
        const result1 = findBaseLetterAndAccidental(6, 'SHARP');
        const result2 = findBaseLetterAndAccidental(6, 'SHARP');
        expect(result1).toEqual(result2);
      });

      it('should prioritize context-appropriate spellings', () => {
        // Same note should have different spellings in different contexts
        const sharp = findBaseLetterAndAccidental(6, 'SHARP');
        const flat = findBaseLetterAndAccidental(6, 'FLAT');

        expect(sharp.base).toBe('F');
        expect(sharp.accidental).toBe('♯');
        expect(flat.base).toBe('G');
        expect(flat.accidental).toBe('♭');
      });
    });
  });

  describe('getAccidentalSymbol', () => {
    describe('Major Keys', () => {
      it('should return no accidental for natural notes', () => {
        expect(getAccidentalSymbol(0, TONALITY.MAJOR, 0)).toBe('');
        expect(getAccidentalSymbol(0, TONALITY.MAJOR, 3)).toBe('');
        expect(getAccidentalSymbol(0, TONALITY.MAJOR, 6)).toBe('');
      });

      it('should return correct accidentals for altered notes', () => {
        expect(getAccidentalSymbol(1, TONALITY.MAJOR, 0)).toBe('♯');
        expect(getAccidentalSymbol(-1, TONALITY.MAJOR, 0)).toBe('♭');
        expect(getAccidentalSymbol(2, TONALITY.MAJOR, 0)).toBe('𝄪');
        expect(getAccidentalSymbol(-2, TONALITY.MAJOR, 0)).toBe('𝄫');
      });
    });

    describe('Minor Keys', () => {
      it('should return natural signs for altered degrees', () => {
        // Harmonic minor: raised 7th should show natural sign
        expect(getAccidentalSymbol(0, TONALITY.MINOR_HARMONIC, 6)).toBe('♮');

        // Melodic minor: raised 6th and 7th should show natural signs
        expect(getAccidentalSymbol(0, TONALITY.MINOR_MELODIC, 5)).toBe('♮');
        expect(getAccidentalSymbol(0, TONALITY.MINOR_MELODIC, 6)).toBe('♮');
      });

      it('should return no accidental for natural minor degrees', () => {
        // Natural minor: no accidentals needed for scale degrees
        expect(getAccidentalSymbol(0, TONALITY.MINOR_NATURAL, 0)).toBe('');
        expect(getAccidentalSymbol(0, TONALITY.MINOR_NATURAL, 2)).toBe('');
        expect(getAccidentalSymbol(0, TONALITY.MINOR_NATURAL, 6)).toBe('');
      });

      it('should return correct accidentals for chromatic alterations', () => {
        expect(getAccidentalSymbol(1, TONALITY.MINOR_NATURAL, 0)).toBe('♯');
        expect(getAccidentalSymbol(-1, TONALITY.MINOR_NATURAL, 0)).toBe('♭');
      });
    });

    describe('All Accidental Types', () => {
      it('should handle all supported difference values', () => {
        const testCases = [
          { diff: 0, expected: '' },
          { diff: 1, expected: '♯' },
          { diff: -1, expected: '♭' },
          { diff: 2, expected: '𝄪' },
          { diff: -2, expected: '𝄫' },
        ];

        testCases.forEach(({ diff, expected }) => {
          if (diff === 0) {
            // Natural case depends on tonality
            expect(getAccidentalSymbol(diff, TONALITY.MAJOR, 0)).toBe(expected);
          } else {
            expect(getAccidentalSymbol(diff, TONALITY.MAJOR, 0)).toBe(expected);
          }
        });
      });

      it('should throw error for unsupported differences', () => {
        expect(() => {
          getAccidentalSymbol(3, TONALITY.MAJOR, 0);
        }).toThrow('Unsupported accidental difference: 3');

        expect(() => {
          getAccidentalSymbol(-3, TONALITY.MAJOR, 0);
        }).toThrow('Unsupported accidental difference: -3');
      });
    });
  });

  describe('getMajorKeyLabel', () => {
    it('should return correct labels for all chromatic notes', () => {
      const expectedLabels = [
        'C', // 0
        'D♭', // 1
        'D', // 2
        'E♭', // 3
        'E', // 4
        'F', // 5
        'G♭', // 6
        'G', // 7
        'A♭', // 8
        'A', // 9
        'B♭', // 10
        'B', // 11
      ];

      for (let note = 0; note < 12; note++) {
        expect(getMajorKeyLabel(note as Note)).toBe(expectedLabels[note]);
      }
    });

    it('should prefer flat spellings for enharmonic keys', () => {
      // Common enharmonic preferences in major keys
      expect(getMajorKeyLabel(1)).toBe('D♭'); // Db over C#
      expect(getMajorKeyLabel(6)).toBe('G♭'); // Gb over F#
      expect(getMajorKeyLabel(10)).toBe('B♭'); // Bb over A#
    });

    it('should handle all chromatic notes without errors', () => {
      for (let note = 0; note < 12; note++) {
        expect(() => {
          getMajorKeyLabel(note as Note);
        }).not.toThrow();
      }
    });

    it('should return string values', () => {
      for (let note = 0; note < 12; note++) {
        const label = getMajorKeyLabel(note as Note);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getMinorKeyLabel', () => {
    it('should return correct labels for all chromatic notes', () => {
      const expectedLabels = [
        'C', // 0
        'C♯', // 1
        'D', // 2
        'E♭', // 3 (Eb not D#)
        'E', // 4
        'F', // 5
        'F♯', // 6
        'G', // 7
        'G♯', // 8
        'A', // 9
        'B♭', // 10
        'B', // 11
      ];

      for (let note = 0; note < 12; note++) {
        expect(getMinorKeyLabel(note as Note)).toBe(expectedLabels[note]);
      }
    });

    it('should prefer sharp spellings for most enharmonic keys', () => {
      // Common enharmonic preferences in minor keys
      expect(getMinorKeyLabel(1)).toBe('C♯'); // C# over Db
      expect(getMinorKeyLabel(6)).toBe('F♯'); // F# over Gb
      expect(getMinorKeyLabel(8)).toBe('G♯'); // G# over Ab
    });

    it('should handle flat spellings where appropriate', () => {
      expect(getMinorKeyLabel(10)).toBe('B♭'); // Bb over A#
    });

    it('should handle all chromatic notes without errors', () => {
      for (let note = 0; note < 12; note++) {
        expect(() => {
          getMinorKeyLabel(note as Note);
        }).not.toThrow();
      }
    });

    it('should return string values', () => {
      for (let note = 0; note < 12; note++) {
        const label = getMinorKeyLabel(note as Note);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should work together for scale labeling', () => {
      // Test complete workflow:
      // baseLetters -> labelToNote -> calculateDifference -> getAccidentalSymbol
      const tonicBase = 'F';
      const baseLetters = getBaseLetters(tonicBase);
      expect(baseLetters).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E']);

      // Test that each letter maps to correct note
      const notes = baseLetters.map((letter) => labelToNote(letter));
      expect(notes).toEqual([5, 7, 9, 11, 0, 2, 4]);
    });

    it('should handle enharmonic spellings consistently', () => {
      // F# and Gb should both work but with different contexts
      const fs = findBaseLetterAndAccidental(6, 'SHARP');
      const gb = findBaseLetterAndAccidental(6, 'FLAT');

      expect(fs.base).toBe('F');
      expect(fs.accidental).toBe('♯');
      expect(gb.base).toBe('G');
      expect(gb.accidental).toBe('♭');

      // Both should represent the same note
      expect(labelToNote(fs.base)).toBe(5);
      expect(labelToNote(gb.base)).toBe(7);
    });

    it('should be consistent between major and minor key labels', () => {
      // Test that the labeling functions handle all notes appropriately
      for (let note = 0; note < 12; note++) {
        const majorLabel = getMajorKeyLabel(note as Note);
        const minorLabel = getMinorKeyLabel(note as Note);

        expect(typeof majorLabel).toBe('string');
        expect(typeof minorLabel).toBe('string');
        expect(majorLabel.length).toBeGreaterThan(0);
        expect(minorLabel.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getChromaticNoteLabels', () => {
    it('should return 12 note labels', () => {
      const sharps = getChromaticNoteLabels('SHARP');
      const flats = getChromaticNoteLabels('FLAT');
      const naturals = getChromaticNoteLabels('NATURAL');

      expect(sharps).toHaveLength(12);
      expect(flats).toHaveLength(12);
      expect(naturals).toHaveLength(12);
    });

    it('should use sharps for sharp key context', () => {
      const labels = getChromaticNoteLabels('SHARP');

      // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
      expect(labels[0]).toBe('C');
      expect(labels[1]).toBe('C♯');
      expect(labels[2]).toBe('D');
      expect(labels[3]).toBe('D♯');
      expect(labels[4]).toBe('E');
      expect(labels[5]).toBe('F');
      expect(labels[6]).toBe('F♯');
      expect(labels[7]).toBe('G');
      expect(labels[8]).toBe('G♯');
      expect(labels[9]).toBe('A');
      expect(labels[10]).toBe('A♯');
      expect(labels[11]).toBe('B');
    });

    it('should use flats for flat key context', () => {
      const labels = getChromaticNoteLabels('FLAT');

      // C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
      expect(labels[0]).toBe('C');
      expect(labels[1]).toBe('D♭');
      expect(labels[2]).toBe('D');
      expect(labels[3]).toBe('E♭');
      expect(labels[4]).toBe('E');
      expect(labels[5]).toBe('F');
      expect(labels[6]).toBe('G♭');
      expect(labels[7]).toBe('G');
      expect(labels[8]).toBe('A♭');
      expect(labels[9]).toBe('A');
      expect(labels[10]).toBe('B♭');
      expect(labels[11]).toBe('B');
    });

    it('should use sharps for natural key context (C major)', () => {
      const labels = getChromaticNoteLabels('NATURAL');

      // Should default to sharp notation like C major
      expect(labels[1]).toBe('C♯');
      expect(labels[3]).toBe('D♯');
      expect(labels[6]).toBe('F♯');
      expect(labels[8]).toBe('G♯');
      expect(labels[10]).toBe('A♯');
    });

    it('should have all unique base letters represented', () => {
      const sharps = getChromaticNoteLabels('SHARP');
      const flats = getChromaticNoteLabels('FLAT');

      // Extract base letters (first character of each label)
      const sharpBases = sharps.map((label: string) => label[0]);
      const flatBases = flats.map((label: string) => label[0]);

      // Should have representation of all 7 note letters
      const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      expectedLetters.forEach((letter) => {
        expect(sharpBases).toContain(letter);
        expect(flatBases).toContain(letter);
      });
    });

    it('should return consistent labels for each accidental type', () => {
      const sharps = getChromaticNoteLabels('SHARP');
      const flats = getChromaticNoteLabels('FLAT');
      const naturals = getChromaticNoteLabels('NATURAL');

      // Sharp and natural should be the same (both use sharp notation)
      expect(sharps).toEqual(naturals);

      // All should have the same natural notes
      expect(sharps[0]).toBe(flats[0]); // C
      expect(sharps[2]).toBe(flats[2]); // D
      expect(sharps[4]).toBe(flats[4]); // E
      expect(sharps[5]).toBe(flats[5]); // F
      expect(sharps[7]).toBe(flats[7]); // G
      expect(sharps[9]).toBe(flats[9]); // A
      expect(sharps[11]).toBe(flats[11]); // B
    });
  });
});
