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
import { wrapArray } from '../utils/array-utils';
import { CHORD_TYPE_ENUM } from '../core/chords';

/**
 * Type representing a chord type string literal.
 * Ensures only valid chord type abbreviations are used in Roman numeral analysis.
 */
type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

/**
 * Map of chord types to their symbolic representations in Roman numeral analysis.
 * These symbols provide visual clarity and follow traditional music theory notation.
 * 
 * @example
 * ```typescript
 * CHORD_TYPE_LABELS["d"]    // "°" (diminished symbol)
 * CHORD_TYPE_LABELS["maj7"] // "ᴹ⁷" (major seventh symbol)
 * ```
 */
const CHORD_TYPE_LABELS = {
  /** Diminished chord symbol */
  "d": "°",
  /** Augmented chord symbol */
  "+": "+",
  /** Major seventh chord symbol */
  "maj7": "ᴹ⁷",
  /** Dominant seventh chord symbol */
  "7": "⁷",
  /** Minor seventh chord symbol */
  "m7": "⁷",
  /** Half-diminished seventh chord symbol */
  "dm7": "𐞢⁷",
  /** Fully diminished seventh chord symbol */
  "d7": "°⁷",
} as const;

/**
 * Union type of all chord quality symbols used in Roman numeral notation.
 */
export type CHORD_TYPE_LABEL_SUFFIX =
  typeof CHORD_TYPE_LABELS[keyof typeof CHORD_TYPE_LABELS];

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
  "i",   // 1st degree - Tonic
  "ii",  // 2nd degree - Supertonic  
  "iii", // 3rd degree - Mediant
  "iv",  // 4th degree - Subdominant
  "v",   // 5th degree - Dominant
  "vi",  // 6th degree - Submediant
  "vii", // 7th degree - Leading tone
] as const satisfies string[];

/**
 * Type representing lowercase Roman numerals (i, ii, iii, etc.).
 * Used for minor and diminished chords.
 */
type LowerRomanNumeral = typeof romanNumerals[number];

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
    const numeral =
      (chordType === "M" || chordType === "+" || chordType === "maj7" ||
        chordType === "7")
        ? baseNumeral.toUpperCase() as UpperRomanNumeral
        : baseNumeral;

    // Add chord quality symbol if one exists for this chord type
    return `${numeral}${CHORD_TYPE_LABELS[chordType] || ""}` as RomanNumeral;
  });
}

/**
 * Interface defining the harmonic properties of a musical scale.
 * Contains both the chord types and their Roman numeral representations.
 */
interface ScaleProperties {
  /** Array of chord types for each scale degree */
  chordTypes: CHORD_TYPE[];
  /** Array of Roman numeral representations for each scale degree */
  romanNumerals: RomanNumeral[];
}

/**
 * The canonical chord progression pattern for major scales.
 * This pattern is fundamental to Western harmony and forms the basis
 * for understanding diatonic chord relationships.
 * 
 * Pattern: I - ii - iii - IV - V - vi - vii°
 * Functions: Tonic - Subdominant - Tonic - Subdominant - Dominant - Tonic - Dominant
 */
const majorScaleChordTypes: CHORD_TYPE[] = ["M", "m", "m", "M", "M", "m", "d"];

/**
 * Complete harmonic properties for major scales.
 * Provides both chord types and Roman numeral analysis for all seven degrees.
 * 
 * @example
 * ```typescript
 * // C Major scale analysis:
 * // I (C major), ii (D minor), iii (E minor), IV (F major), 
 * // V (G major), vi (A minor), vii° (B diminished)
 * ```
 */
const majorScaleProperties: ScaleProperties = {
  chordTypes: majorScaleChordTypes,
  romanNumerals: getTriadRomanNumeralsFromChordTypes(majorScaleChordTypes),
};

/**
 * Complete harmonic properties for natural minor scales.
 * 
 * Natural minor is the relative minor of major, starting from the 6th degree.
 * This creates a different pattern of chord qualities and functions.
 * 
 * Pattern: i - ii° - ♭III - iv - v - ♭VI - ♭VII
 * Note: The v chord is often altered to V (major) in practice for stronger resolution.
 * 
 * @example
 * ```typescript
 * // A Natural Minor scale analysis:
 * // i (A minor), ii° (B diminished), ♭III (C major), iv (D minor),
 * // v (E minor), ♭VI (F major), ♭VII (G major)
 * ```
 */
const minorNaturalScaleProperties: ScaleProperties = {
  chordTypes: wrapArray(majorScaleChordTypes, 5),
  romanNumerals: getTriadRomanNumeralsFromChordTypes(
    wrapArray(majorScaleChordTypes, 5),
  ),
};

/**
 * Complete harmonic properties for harmonic minor scales.
 * 
 * The raised 7th degree in harmonic minor creates unique chord qualities,
 * including the characteristic augmented chord on the ♭III degree and
 * the major dominant (V) which provides strong resolution to i.
 * 
 * Pattern: i - ii° - ♭III+ - iv - V - ♭VI - vii°
 * The augmented ♭III and major V are distinctive features of this scale.
 * 
 * @example
 * ```typescript
 * // A Harmonic Minor scale analysis:
 * // i (A minor), ii° (B diminished), ♭III+ (C augmented), iv (D minor),
 * // V (E major), ♭VI (F major), vii° (G# diminished)
 * ```
 */
const minorHarmonicScaleProperties: ScaleProperties = {
  chordTypes: ["m", "d", "+", "m", "M", "M", "d"],
  romanNumerals: getTriadRomanNumeralsFromChordTypes([
    "m",
    "d",
    "+",
    "m",
    "M",
    "M",
    "d",
  ]),
};

/**
 * Complete harmonic properties for melodic minor scales (ascending/jazz form).
 * 
 * The raised 6th and 7th degrees create a unique harmonic palette that's
 * widely used in jazz and contemporary music. This form eliminates the
 * augmented 2nd interval found in harmonic minor.
 * 
 * Pattern: i - ii - ♭III+ - IV - V - vi° - vii°
 * Notable features: major IV and V chords, diminished vi and vii chords.
 * 
 * @example
 * ```typescript
 * // A Melodic Minor scale analysis:
 * // i (A minor), ii (B minor), ♭III+ (C augmented), IV (D major),
 * // V (E major), vi° (F# diminished), vii° (G# diminished)
 * ```
 */
const minorMelodicScaleProperties: ScaleProperties = {
  chordTypes: ["m", "m", "+", "M", "M", "d", "d"],
  romanNumerals: getTriadRomanNumeralsFromChordTypes([
    "m",
    "m",
    "+",
    "M",
    "M",
    "d",
    "d",
  ]),
};

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
const tonalityUtilsMap: Record<TONALITY, ScaleProperties> = {
  [TONALITY.MAJOR]: majorScaleProperties,
  [TONALITY.MINOR_NATURAL]: minorNaturalScaleProperties,
  [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleProperties,
  [TONALITY.MINOR_MELODIC]: minorMelodicScaleProperties,
};

/**
 * Retrieves the Roman numeral analysis for all diatonic chords in a given tonality.
 * 
 * This function is essential for harmonic analysis, chord progression study,
 * and understanding the functional relationships between chords in a key.
 * 
 * @param tonality - The scale type to analyze (MAJOR, MINOR_NATURAL, etc.)
 * @returns Array of Roman numeral strings for all seven diatonic degrees
 * 
 * @example
 * ```typescript
 * // Get Roman numerals for C Major
 * getDiatonicChordRomanNumerals(TONALITY.MAJOR)
 * // Returns: ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
 * 
 * // Get Roman numerals for A Harmonic Minor
 * getDiatonicChordRomanNumerals(TONALITY.MINOR_HARMONIC)
 * // Returns: ["i", "ii°", "III+", "iv", "V", "VI", "vii°"]
 * ```
 */
export function getDiatonicChordRomanNumerals(tonality: TONALITY): RomanNumeral[] {
  return tonalityUtilsMap[tonality].romanNumerals;
}

/**
 * Retrieves the chord types for all diatonic chords in a given tonality.
 * 
 * This function provides the underlying chord quality information that
 * corresponds to the Roman numeral analysis. Essential for chord construction
 * and harmonic analysis applications.
 * 
 * @param tonality - The scale type to analyze (MAJOR, MINOR_NATURAL, etc.)
 * @returns Array of chord type strings for all seven diatonic degrees
 * 
 * @example
 * ```typescript
 * // Get chord types for C Major
 * getDiatonicChordTypes(TONALITY.MAJOR)
 * // Returns: ["M", "m", "m", "M", "M", "m", "d"]
 * 
 * // Get chord types for A Harmonic Minor  
 * getDiatonicChordTypes(TONALITY.MINOR_HARMONIC)
 * // Returns: ["m", "d", "+", "m", "M", "M", "d"]
 * ```
 */
export function getDiatonicChordTypes(tonality: TONALITY): CHORD_TYPE[] {
  return tonalityUtilsMap[tonality].chordTypes;
}