import { describe, expect, it } from 'vitest';
import { wrapArray } from '../../utils/array-utils';

describe('Array Utils', () => {
  describe('wrapArray', () => {
    describe('Basic Functionality', () => {
      it('should wrap array starting from index 0', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 0);
        expect(result).toEqual([1, 2, 3, 4, 5]);
      });

      it('should wrap array starting from index 1', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 1);
        expect(result).toEqual([2, 3, 4, 5, 1]);
      });

      it('should wrap array starting from index 2', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 2);
        expect(result).toEqual([3, 4, 5, 1, 2]);
      });

      it('should wrap array starting from last index', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 4);
        expect(result).toEqual([5, 1, 2, 3, 4]);
      });

      it('should wrap array starting from middle index', () => {
        const arr = ['a', 'b', 'c', 'd', 'e', 'f'];
        const result = wrapArray(arr, 3);
        expect(result).toEqual(['d', 'e', 'f', 'a', 'b', 'c']);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty array', () => {
        const arr: number[] = [];
        const result = wrapArray(arr, 0);
        expect(result).toEqual([]);
      });

      it('should handle single element array', () => {
        const arr = [42];
        const result = wrapArray(arr, 0);
        expect(result).toEqual([42]);
      });

      it('should handle single element array with any index', () => {
        const arr = [42];
        expect(wrapArray(arr, 5)).toEqual([42]);
        expect(wrapArray(arr, -3)).toEqual([42]);
        expect(wrapArray(arr, 100)).toEqual([42]);
      });

      it('should handle two element array', () => {
        const arr = [1, 2];
        expect(wrapArray(arr, 0)).toEqual([1, 2]);
        expect(wrapArray(arr, 1)).toEqual([2, 1]);
      });
    });

    describe('Index Handling', () => {
      it('should handle negative indices', () => {
        const arr = [1, 2, 3, 4, 5];

        // -1 should wrap to last element (index 4)
        const result1 = wrapArray(arr, -1);
        expect(result1).toEqual([5, 1, 2, 3, 4]);

        // -2 should wrap to second-to-last element (index 3)
        const result2 = wrapArray(arr, -2);
        expect(result2).toEqual([4, 5, 1, 2, 3]);

        // -5 should wrap to first element (index 0)
        const result3 = wrapArray(arr, -5);
        expect(result3).toEqual([1, 2, 3, 4, 5]);
      });

      it('should handle large positive indices', () => {
        const arr = [1, 2, 3, 4, 5];

        // Index 5 should wrap to index 0
        const result1 = wrapArray(arr, 5);
        expect(result1).toEqual([1, 2, 3, 4, 5]);

        // Index 6 should wrap to index 1
        const result2 = wrapArray(arr, 6);
        expect(result2).toEqual([2, 3, 4, 5, 1]);

        // Index 10 should wrap to index 0
        const result3 = wrapArray(arr, 10);
        expect(result3).toEqual([1, 2, 3, 4, 5]);
      });

      it('should handle large negative indices', () => {
        const arr = [1, 2, 3, 4, 5];

        // Index -6 should wrap to index 4
        const result1 = wrapArray(arr, -6);
        expect(result1).toEqual([5, 1, 2, 3, 4]);

        // Index -10 should wrap to index 0
        const result2 = wrapArray(arr, -10);
        expect(result2).toEqual([1, 2, 3, 4, 5]);

        // Index -11 should wrap to index 4
        const result3 = wrapArray(arr, -11);
        expect(result3).toEqual([5, 1, 2, 3, 4]);
      });
    });

    describe('Different Data Types', () => {
      it('should work with string arrays', () => {
        const arr = ['apple', 'banana', 'cherry'];
        const result = wrapArray(arr, 1);
        expect(result).toEqual(['banana', 'cherry', 'apple']);
      });

      it('should work with boolean arrays', () => {
        const arr = [true, false, true, false];
        const result = wrapArray(arr, 2);
        expect(result).toEqual([true, false, true, false]);
      });

      it('should work with object arrays', () => {
        const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = wrapArray(arr, 1);
        expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 1 }]);
      });

      it('should work with mixed type arrays', () => {
        const arr = [1, 'two', true, null, undefined];
        const result = wrapArray(arr, 2);
        expect(result).toEqual([true, null, undefined, 1, 'two']);
      });
    });

    describe('Array Immutability', () => {
      it('should not mutate original array', () => {
        const arr = [1, 2, 3, 4, 5];
        const original = [...arr];

        wrapArray(arr, 2);

        expect(arr).toEqual(original);
      });

      it('should return new array instance', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 2);

        expect(result).not.toBe(arr);
      });

      it('should preserve original array elements', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = wrapArray(arr, 2);

        // All elements should be present
        expect(result).toHaveLength(arr.length);
        arr.forEach((element) => {
          expect(result).toContain(element);
        });
      });
    });

    describe('Music Theory Use Cases', () => {
      it('should work with scale degrees', () => {
        // Major scale pattern: W-W-H-W-W-W-H
        const majorScalePattern = [2, 2, 1, 2, 2, 2, 1];

        // Starting from 2nd degree (Dorian mode)
        const dorian = wrapArray(majorScalePattern, 1);
        expect(dorian).toEqual([2, 1, 2, 2, 2, 1, 2]);

        // Starting from 5th degree (Mixolydian mode)
        const mixolydian = wrapArray(majorScalePattern, 4);
        expect(mixolydian).toEqual([2, 2, 1, 2, 2, 1, 2]);
      });

      it('should work with chord types', () => {
        // Major scale chord types: M-m-m-M-M-m-d
        const majorChordTypes = ['M', 'm', 'm', 'M', 'M', 'm', 'd'];

        // Natural minor is relative major starting from 6th degree
        const naturalMinor = wrapArray(majorChordTypes, 5);
        expect(naturalMinor).toEqual(['m', 'd', 'M', 'm', 'm', 'M', 'M']);
      });

      it('should work with Roman numerals', () => {
        const majorRomanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

        // Relative minor Roman numerals
        const minorRomanNumerals = wrapArray(majorRomanNumerals, 5);
        expect(minorRomanNumerals).toEqual(['vi', 'vii°', 'I', 'ii', 'iii', 'IV', 'V']);
      });

      it('should work with note names', () => {
        const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Starting from F# (index 6)
        const fSharpScale = wrapArray(chromaticNotes, 6);
        expect(fSharpScale)
          .toEqual(['F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F']);
      });

      it('should work with circle of fifths', () => {
        const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

        // Starting from D (index 2)
        const dMajorSequence = wrapArray(circleOfFifths, 2);
        expect(dMajorSequence)
          .toEqual(['D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F', 'C', 'G']);
      });
    });

    describe('Performance and Consistency', () => {
      it('should handle large arrays efficiently', () => {
        const largeArray = Array.from({ length: 1000 }, (_, i) => i);
        const result = wrapArray(largeArray, 500);

        expect(result).toHaveLength(1000);
        expect(result[0]).toBe(500);
        expect(result[999]).toBe(499);
      });

      it('should be consistent across multiple calls', () => {
        const arr = [1, 2, 3, 4, 5];
        const result1 = wrapArray(arr, 2);
        const result2 = wrapArray(arr, 2);

        expect(result1).toEqual(result2);
      });

      it('should handle zero-based indexing correctly', () => {
        const arr = [10, 20, 30, 40, 50];

        // Test all valid indices
        for (let i = 0; i < arr.length; i++) {
          const result = wrapArray(arr, i);
          expect(result).toHaveLength(arr.length);
          expect(result[0]).toBe(arr[i]);
        }
      });
    });

    describe('Mathematical Properties', () => {
      it('should satisfy rotation property', () => {
        const arr = [1, 2, 3, 4, 5];

        // Double rotation should equal single rotation
        const singleRotation = wrapArray(arr, 2);
        const doubleRotation = wrapArray(wrapArray(arr, 1), 1);

        expect(singleRotation).toEqual(doubleRotation);
      });

      it('should satisfy inverse property', () => {
        const arr = [1, 2, 3, 4, 5];
        const rotated = wrapArray(arr, 2);
        const inverted = wrapArray(rotated, -2);

        expect(inverted).toEqual(arr);
      });

      it('should satisfy modulo property', () => {
        const arr = [1, 2, 3, 4, 5];

        // Index 7 should equal index 2 (7 % 5 = 2)
        const result1 = wrapArray(arr, 7);
        const result2 = wrapArray(arr, 2);

        expect(result1).toEqual(result2);
      });

      it('should handle full rotations', () => {
        const arr = [1, 2, 3, 4, 5];

        // Full rotation (index = array length) should return original
        const fullRotation = wrapArray(arr, arr.length);
        expect(fullRotation).toEqual(arr);

        // Multiple full rotations
        const multipleRotations = wrapArray(arr, arr.length * 3);
        expect(multipleRotations).toEqual(arr);
      });
    });

    describe('Error Handling', () => {
      it('should handle NaN index gracefully', () => {
        const arr = [1, 2, 3, 4, 5];

        // NaN % length results in NaN, which gets handled by the modulo logic
        expect(() => wrapArray(arr, NaN)).not.toThrow();
      });

      it('should handle Infinity index gracefully', () => {
        const arr = [1, 2, 3, 4, 5];

        // Infinity % length results in NaN, which gets handled
        expect(() => wrapArray(arr, Infinity)).not.toThrow();
        expect(() => wrapArray(arr, -Infinity)).not.toThrow();
      });

      it('should handle floating point indices', () => {
        const arr = [1, 2, 3, 4, 5];

        // Should truncate to integer
        const result = wrapArray(arr, 2.7);
        expect(result).toEqual([3, 4, 5, 1, 2]);
      });
    });
  });
});
