import Foundation

/// Enumeration of all supported chord types with their standard abbreviations.
/// Covers the most common chords in Western music theory:
/// - Basic triads (major, minor, diminished, augmented)
/// - Seventh chords (major 7th, dominant 7th, minor 7th, half-diminished, fully diminished)
public enum ChordType: String, CaseIterable, Sendable, Hashable, Codable {
    /// Major triad - bright, consonant sound (1-3-5)
    case major = "M"
    /// Minor triad - darker, sadder sound (1-♭3-5)
    case minor = "m"
    /// Diminished triad - tense, unstable sound (1-♭3-♭5)
    case diminished = "d"
    /// Augmented triad - dreamy, mysterious sound (1-3-#5)
    case augmented = "+"
    /// Major seventh chord - sophisticated, jazzy sound (1-3-5-7)
    case majorSeventh = "maj7"
    /// Dominant seventh chord - bluesy, resolving sound (1-3-5-♭7)
    case dominantSeventh = "7"
    /// Minor seventh chord - mellow, jazzy sound (1-♭3-5-♭7)
    case minorSeventh = "m7"
    /// Half-diminished seventh chord - haunting, unresolved (1-♭3-♭5-♭7)
    case halfDiminishedSeventh = "dm7"
    /// Fully diminished seventh chord - very tense, symmetrical (1-♭3-♭5-♭♭7)
    case fullyDiminishedSeventh = "d7"
    /// Augmented major seventh chord - exotic, dreamy sound (1-3-#5-7)
    case augmentedMajorSeventh = "+maj7"
    /// Augmented dominant seventh chord - tense, exotic sound (1-3-#5-♭7)
    case augmentedDominantSeventh = "+7"
    /// Minor-major seventh chord - bittersweet, sophisticated sound (1-♭3-5-7)
    case minorMajorSeventh = "mM7"
    
    /// The display symbol for this chord type
    public var symbol: String {
        rawValue
    }
    
    /// Whether this is a major-quality chord (uses uppercase Roman numeral)
    public var isMajorQuality: Bool {
        switch self {
        case .major, .augmented, .majorSeventh, .dominantSeventh,
             .augmentedMajorSeventh, .augmentedDominantSeventh:
            return true
        default:
            return false
        }
    }
    
    /// Whether this is a seventh chord
    public var isSeventh: Bool {
        switch self {
        case .majorSeventh, .dominantSeventh, .minorSeventh,
             .halfDiminishedSeventh, .fullyDiminishedSeventh,
             .augmentedMajorSeventh, .augmentedDominantSeventh, .minorMajorSeventh:
            return true
        default:
            return false
        }
    }
    
    /// The intervals that make up this chord type
    public var intervals: [Int] {
        switch self {
        case .major:
            return [Interval.P1, Interval.M3, Interval.P5]
        case .minor:
            return [Interval.P1, Interval.m3, Interval.P5]
        case .diminished:
            return [Interval.P1, Interval.m3, Interval.d5]
        case .augmented:
            return [Interval.P1, Interval.M3, Interval.A5]
        case .majorSeventh:
            return [Interval.P1, Interval.M3, Interval.P5, Interval.M7]
        case .dominantSeventh:
            return [Interval.P1, Interval.M3, Interval.P5, Interval.m7]
        case .minorSeventh:
            return [Interval.P1, Interval.m3, Interval.P5, Interval.m7]
        case .halfDiminishedSeventh:
            return [Interval.P1, Interval.m3, Interval.d5, Interval.m7]
        case .fullyDiminishedSeventh:
            return [Interval.P1, Interval.m3, Interval.d5, Interval.d7]
        case .augmentedMajorSeventh:
            return [Interval.P1, Interval.M3, Interval.A5, Interval.M7]
        case .augmentedDominantSeventh:
            return [Interval.P1, Interval.M3, Interval.A5, Interval.m7]
        case .minorMajorSeventh:
            return [Interval.P1, Interval.m3, Interval.P5, Interval.M7]
        }
    }
}
