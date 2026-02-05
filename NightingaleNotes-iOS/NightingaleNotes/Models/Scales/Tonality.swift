import Foundation

/// Enumeration of supported musical tonalities (scale types).
/// Each tonality represents a different pattern of intervals that creates
/// distinct harmonic and melodic characteristics.
public enum Tonality: String, CaseIterable, Sendable, Hashable, Codable {
    /// Major scale (Ionian mode) - bright, happy character
    case major = "Major"
    /// Natural minor scale (Aeolian mode) - dark, sad character
    case minorNatural = "Minor Natural"
    /// Harmonic minor scale - exotic sound with raised 7th degree
    case minorHarmonic = "Minor Harmonic"
    /// Melodic minor scale (ascending/jazz form) - smooth melodic motion
    case minorMelodic = "Minor Melodic"
    
    /// Human-readable display name
    public var displayName: String {
        rawValue
    }
    
    /// Whether this is a minor tonality
    public var isMinor: Bool {
        switch self {
        case .major:
            return false
        case .minorNatural, .minorHarmonic, .minorMelodic:
            return true
        }
    }
}

/// The interval patterns for each tonality, expressed as semitones from the tonic
public struct ScaleIntervals {
    /// Major scale intervals: W-W-H-W-W-W-H
    /// Pattern: 1-2-3-4-5-6-7 (all natural degrees)
    public static let major: [Int] = [0, 2, 4, 5, 7, 9, 11]
    
    /// Natural minor scale intervals: W-H-W-W-H-W-W
    /// Pattern: 1-2-♭3-4-5-♭6-♭7 (lowered 3rd, 6th, and 7th degrees)
    public static let minorNatural: [Int] = [0, 2, 3, 5, 7, 8, 10]
    
    /// Harmonic minor scale intervals: W-H-W-W-H-A2-H
    /// Pattern: 1-2-♭3-4-5-♭6-7 (raised 7th creates augmented 2nd interval)
    public static let minorHarmonic: [Int] = [0, 2, 3, 5, 7, 8, 11]
    
    /// Melodic minor scale intervals (ascending/jazz form): W-H-W-W-W-W-H
    /// Pattern: 1-2-♭3-4-5-6-7 (raised 6th and 7th for smoother melody)
    public static let minorMelodic: [Int] = [0, 2, 3, 5, 7, 9, 11]
    
    /// Natural notes (white keys): C, D, E, F, G, A, B
    public static let naturalNotes: [Int] = major
    
    /// Returns the interval pattern for a given tonality
    public static func intervals(for tonality: Tonality) -> [Int] {
        switch tonality {
        case .major:
            return major
        case .minorNatural:
            return minorNatural
        case .minorHarmonic:
            return minorHarmonic
        case .minorMelodic:
            return minorMelodic
        }
    }
}

/// Traditional names for the seven degrees of a diatonic scale.
/// Used in classical music theory to describe the function of each scale degree.
public enum ScaleDegree: Int, CaseIterable, Sendable {
    /// 1st degree - the central tone, point of rest
    case tonic = 0
    /// 2nd degree - creates tension moving to mediant or back to tonic
    case supertonic = 1
    /// 3rd degree - determines major/minor quality
    case mediant = 2
    /// 4th degree - creates strong pull back to tonic
    case subdominant = 3
    /// 5th degree - strongest harmonic support after tonic
    case dominant = 4
    /// 6th degree - provides color and emotional depth
    case submediant = 5
    /// 7th degree - creates strong pull to resolve up to tonic
    case leadingTone = 6
    
    public var name: String {
        switch self {
        case .tonic: return "Tonic"
        case .supertonic: return "Supertonic"
        case .mediant: return "Mediant"
        case .subdominant: return "Subdominant"
        case .dominant: return "Dominant"
        case .submediant: return "Submediant"
        case .leadingTone: return "Leading tone"
        }
    }
}
