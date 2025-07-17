/**
 * @fileoverview Roman numeral analysis system for music theory.
 *
 * This module provides comprehensive Roman numeral analysis functionality, which is
 * fundamental to understanding harmonic progressions and diatonic chord relationships
 * in Western music theory. It maps chord types to their traditional Roman numeral
 * representations across different tonalities.
 *
 * Roman numeral analysis uses:
 * - Uppercase numerals (I, II, III) for major and augmented chords
 * - Lowercase numerals (i, ii, iii) for minor and diminished chords
 * - Special symbols for chord quality (°, +, ⁷, etc.)
 */

import { TONALITY } from '../core/scales';
import { CHORD_TYPE, TONALITY_DIATONIC_CHORD_ORDER } from '../core/chords';

/**
 * Map of chord types to their symbolic representations in Roman numeral analysis.
 * These symbols provide visual clarity and follow traditional music theory notation.
 *
 * @example
 * ```typescript
 * CHORD_TPE_SUFFIX_MAP["d"]    // "°" (diminished symbol)
 * CHORD_TPE_SUFFIX_MAP["maj7"] // "ᴹ⁷" (major seventh symbol)
 * ```
 */
const CHORD_TYPE_SUFFIX_MAP = {
  /** Diminished chord symbol */
  d: '°',
  /** Augmented chord symbol */
  '+': '+',
  /** Major seventh chord symbol */
  maj7: 'ᴹ⁷',
  /** Dominant seventh chord symbol */
  7: '⁷',
  /** Minor seventh chord symbol */
  m7: '⁷',
  /** Half-diminished seventh chord symbol */
  dm7: '𐞢⁷',
  /** Fully diminished seventh chord symbol */
  d7: '°⁷',
} as const;

/**
 * Union type of all chord quality symbols used in Roman numeral notation.
 */
export type CHORD_TYPE_LABEL_SUFFIX =
  (typeof CHORD_TYPE_SUFFIX_MAP)[keyof typeof CHORD_TYPE_SUFFIX_MAP];

/**
 * Array of lowercase Roman numerals representing the seven diatonic scale degrees.
 * These form the foundation for all Roman numeral analysis.
 *
 * @example
 * ```typescript
 * romanNumerals[0] // "i" (tonic)
 * romanNumerals[4] // "v" (dominant)
 * romanNumerals[6] // "vii" (leading tone)
 * ```
 */
const romanNumerals = [
  'i', // 1st degree - Tonic
  'ii', // 2nd degree - Supertonic
  'iii', // 3rd degree - Mediant
  'iv', // 4th degree - Subdominant
  'v', // 5th degree - Dominant
  'vi', // 6th degree - Submediant
  'vii', // 7th degree - Leading tone
] as const satisfies string[];

/**
 * Type representing lowercase Roman numerals (i, ii, iii, etc.).
 * Used for minor and diminished chords.
 */
type LowerRomanNumeral = (typeof romanNumerals)[number];

/**
 * Type representing uppercase Roman numerals (I, II, III, etc.).
 * Used for major and augmented chords.
 */
type UpperRomanNumeral = Uppercase<LowerRomanNumeral>;

/**
 * Type representing either uppercase or lowercase Roman numerals.
 * The base form before adding chord quality symbols.
 */
type BaseRomanNumeral = LowerRomanNumeral | UpperRomanNumeral;

/**
 * Type representing Roman numerals with chord quality symbols.
 * Examples: i°, V⁷, viiø⁷
 */
type QualityRomanNumeral = `${BaseRomanNumeral}${CHORD_TYPE_LABEL_SUFFIX}`;

/**
 * Complete type for all possible Roman numeral representations.
 * Can be either basic (I, ii) or with quality symbols (V⁷, i°).
 */
type RomanNumeral = BaseRomanNumeral | QualityRomanNumeral;

/**
 * Converts an array of chord types to their corresponding Roman numeral representations.
 *
 * This function encapsulates the logic for determining:
 * - Case (uppercase for major/augmented, lowercase for minor/diminished)
 * - Quality symbols (°, +, ⁷, etc.)
 * - Proper formatting according to music theory conventions
 *
 * @param chordTypes - Array of chord types for the seven diatonic degrees
 * @returns Array of Roman numeral strings with appropriate formatting
 *
 * @example
 * ```typescript
 * // Major scale chord types: [M, m, m, M, M, m, d]
 * getTriadRomanNumeralsFromChordTypes(["M", "m", "m", "M", "M", "m", "d"])
 * // Returns: ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
 * ```
 */
function getTriadRomanNumeralsFromChordTypes(
  chordTypes: CHORD_TYPE[],
): RomanNumeral[] {
  return chordTypes.map((chordType, index) => {
    const baseNumeral = romanNumerals[index];

    // Uppercase for major, augmented, and seventh chords built on major triads
    const numeral = chordType === 'M'
      || chordType === '+'
      || chordType === 'maj7'
      || chordType === '7'
      ? (baseNumeral.toUpperCase() as UpperRomanNumeral)
      : baseNumeral;

    // Add chord quality symbol if one exists for this chord type
    return `${numeral}${CHORD_TYPE_SUFFIX_MAP[chordType] || ''}` as RomanNumeral;
  });
}

/**
 * Interface defining the harmonic properties of a musical scale.
 * Contains both the chord types and their Roman numeral representations.
 */
interface TonalityDiatonicChordProperties {
  /** Array of chord types for each scale degree */
  chordTypes: CHORD_TYPE[];
  /** Array of Roman numeral representations for each scale degree */
  romanNumerals: RomanNumeral[];
}

function getScaleProperties(tonality: TONALITY): TonalityDiatonicChordProperties {
  return {
    chordTypes: TONALITY_DIATONIC_CHORD_ORDER[tonality],
    get romanNumerals() {
      return getTriadRomanNumeralsFromChordTypes(this.chordTypes);
    },
  };
}

/**
 * Comprehensive mapping of all supported tonalities to their harmonic properties.
 * This serves as the central lookup table for Roman numeral analysis across
 * different scale types.
 *
 * Each entry provides complete harmonic analysis including:
 * - Chord types for all seven degrees
 * - Proper Roman numeral notation
 * - Quality symbols and case conventions
 */
export const tonalityDiatonicChordsMap: Record<TONALITY, TonalityDiatonicChordProperties> = {
  [TONALITY.MAJOR]: getScaleProperties(TONALITY.MAJOR),
  [TONALITY.MINOR_NATURAL]: getScaleProperties(TONALITY.MINOR_NATURAL),
  /**
   * The raised 7th degree in harmonic minor creates unique chord qualities,
   * including the characteristic augmented chord on the ♭III degree and
   * the major dominant (V) which provides strong resolution to i.
   *
   * Pattern: i - ii° - ♭III+ - iv - V - ♭VI - vii°
   * The augmented ♭III and major V are distinctive features of this scale.
   */
  [TONALITY.MINOR_HARMONIC]: getScaleProperties(TONALITY.MINOR_HARMONIC),
  /**
   * The raised 6th and 7th degrees create a unique harmonic palette that's
   * widely used in jazz and contemporary music. This form eliminates the
   * augmented 2nd interval found in harmonic minor.
   *
   * Pattern: i - ii - ♭III+ - IV - V - vi° - vii°
   * Notable features: major IV and V chords, diminished vi and vii chords.
   */
  [TONALITY.MINOR_MELODIC]: getScaleProperties(TONALITY.MINOR_MELODIC),
};
