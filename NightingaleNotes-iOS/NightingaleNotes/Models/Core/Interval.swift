import Foundation

/// Represents musical intervals with their semitone values.
/// Includes all standard interval types: perfect, major, minor, augmented, and diminished.
public enum Interval: Sendable, Hashable {
    // Perfect intervals
    case perfectUnison
    case perfectFourth
    case perfectFifth
    case perfectOctave
    
    // Major intervals
    case majorSecond
    case majorThird
    case majorSixth
    case majorSeventh
    
    // Minor intervals
    case minorSecond
    case minorThird
    case minorSixth
    case minorSeventh
    
    // Augmented intervals
    case augmentedUnison
    case augmentedSecond
    case augmentedThird
    case augmentedFourth
    case augmentedFifth
    case augmentedSixth
    case augmentedSeventh
    
    // Diminished intervals
    case diminishedSecond
    case diminishedThird
    case diminishedFourth
    case diminishedFifth
    case diminishedSixth
    case diminishedSeventh
    case diminishedOctave
    
    /// Tritone (augmented fourth / diminished fifth)
    case tritone
    
    /// The number of semitones in this interval
    public var semitones: Int {
        switch self {
        case .perfectUnison, .diminishedSecond:
            return 0
        case .minorSecond, .augmentedUnison:
            return 1
        case .majorSecond, .diminishedThird:
            return 2
        case .minorThird, .augmentedSecond:
            return 3
        case .majorThird, .diminishedFourth:
            return 4
        case .perfectFourth, .augmentedThird:
            return 5
        case .tritone, .augmentedFourth, .diminishedFifth:
            return 6
        case .perfectFifth, .diminishedSixth:
            return 7
        case .minorSixth, .augmentedFifth:
            return 8
        case .majorSixth, .diminishedSeventh:
            return 9
        case .minorSeventh, .augmentedSixth:
            return 10
        case .majorSeventh, .diminishedOctave:
            return 11
        case .perfectOctave, .augmentedSeventh:
            return 12
        }
    }
    
    /// Creates an interval from a number of semitones
    /// Returns the most common interval for that number of semitones
    public static func from(semitones: Int) -> Interval {
        let normalizedSemitones = ((semitones % 12) + 12) % 12
        switch normalizedSemitones {
        case 0: return .perfectUnison
        case 1: return .minorSecond
        case 2: return .majorSecond
        case 3: return .minorThird
        case 4: return .majorThird
        case 5: return .perfectFourth
        case 6: return .tritone
        case 7: return .perfectFifth
        case 8: return .minorSixth
        case 9: return .majorSixth
        case 10: return .minorSeventh
        case 11: return .majorSeventh
        default: return .perfectUnison
        }
    }
}

// MARK: - Common Interval Constants

extension Interval {
    // Shorthand accessors for common intervals
    public static var P1: Int { perfectUnison.semitones }
    public static var m2: Int { minorSecond.semitones }
    public static var M2: Int { majorSecond.semitones }
    public static var m3: Int { minorThird.semitones }
    public static var M3: Int { majorThird.semitones }
    public static var P4: Int { perfectFourth.semitones }
    public static var TT: Int { tritone.semitones }
    public static var d5: Int { diminishedFifth.semitones }
    public static var A4: Int { augmentedFourth.semitones }
    public static var P5: Int { perfectFifth.semitones }
    public static var A5: Int { augmentedFifth.semitones }
    public static var m6: Int { minorSixth.semitones }
    public static var M6: Int { majorSixth.semitones }
    public static var d7: Int { diminishedSeventh.semitones }
    public static var m7: Int { minorSeventh.semitones }
    public static var M7: Int { majorSeventh.semitones }
    public static var P8: Int { perfectOctave.semitones }
}
