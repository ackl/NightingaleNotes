import Foundation

/// Provides Roman numeral analysis functionality for music theory
public struct RomanNumerals {
    
    /// Suffix symbols for chord types in Roman numeral notation
    public static let chordTypeSuffixes: [ChordType: String] = [
        .major: "",
        .minor: "",
        .diminished: "°",
        .augmented: "+",
        .majorSeventh: "ᴹ⁷",
        .dominantSeventh: "⁷",
        .minorSeventh: "⁷",
        .halfDiminishedSeventh: "𐞢⁷",
        .fullyDiminishedSeventh: "°⁷",
        .augmentedMajorSeventh: "+ᴹ⁷",
        .augmentedDominantSeventh: "+⁷",
        .minorMajorSeventh: "ᴹ⁷"
    ]
    
    /// Lowercase Roman numerals for the seven diatonic scale degrees
    public static let lowerNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii"]
    
    /// Uppercase Roman numerals for the seven diatonic scale degrees
    public static let upperNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"]
    
    /// Converts an array of chord types to their corresponding Roman numeral representations
    /// - Parameter chordTypes: Array of chord types for the seven diatonic degrees
    /// - Returns: Array of Roman numeral strings with appropriate formatting
    public static func getRomanNumerals(from chordTypes: [ChordType]) -> [String] {
        chordTypes.enumerated().map { index, chordType in
            let numeral = chordType.isMajorQuality ? upperNumerals[index] : lowerNumerals[index]
            let suffix = chordTypeSuffixes[chordType] ?? ""
            return "\(numeral)\(suffix)"
        }
    }
    
    /// Gets the Roman numerals for a given tonality
    /// - Parameter tonality: The scale type
    /// - Returns: Array of Roman numeral strings for each degree
    public static func getRomanNumerals(for tonality: Tonality) -> [String] {
        let chordTypes = DiatonicChordMaps.chordTypes(for: tonality)
        return getRomanNumerals(from: chordTypes)
    }
    
    /// Gets the diatonic chord properties for a tonality
    /// - Parameter tonality: The scale type
    /// - Returns: Tuple containing chord types and Roman numerals
    public static func getDiatonicChordProperties(for tonality: Tonality) -> (chordTypes: [ChordType], romanNumerals: [String]) {
        let chordTypes = DiatonicChordMaps.chordTypes(for: tonality)
        let romanNumerals = getRomanNumerals(from: chordTypes)
        return (chordTypes, romanNumerals)
    }
}
