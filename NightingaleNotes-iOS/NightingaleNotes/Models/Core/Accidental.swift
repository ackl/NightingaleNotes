import Foundation

/// Represents musical accidentals (sharps, flats, naturals, double sharps, double flats)
public enum Accidental: String, Sendable, Hashable, CaseIterable {
    case sharp = "SHARP"
    case flat = "FLAT"
    case natural = "NATURAL"
    case doubleSharp = "DOUBLE_SHARP"
    case doubleFlat = "DOUBLE_FLAT"
    
    /// The Unicode musical symbol for this accidental
    public var symbol: String {
        switch self {
        case .sharp: return "♯"
        case .flat: return "♭"
        case .natural: return "♮"
        case .doubleSharp: return "𝄪"
        case .doubleFlat: return "𝄫"
        }
    }
    
    /// The semitone adjustment this accidental applies
    public var semitoneAdjustment: Int {
        switch self {
        case .sharp: return 1
        case .flat: return -1
        case .natural: return 0
        case .doubleSharp: return 2
        case .doubleFlat: return -2
        }
    }
    
    /// Creates an accidental from a semitone difference
    /// - Parameter difference: The semitone difference from natural (-2 to +2)
    /// - Returns: The appropriate accidental, or nil if the difference is out of range
    public static func from(difference: Int) -> Accidental? {
        switch difference {
        case 2: return .doubleSharp
        case 1: return .sharp
        case 0: return .natural
        case -1: return .flat
        case -2: return .doubleFlat
        default: return nil
        }
    }
}

/// Represents accidental types allowed in key signatures.
/// Excludes double sharps and double flats as they don't appear in standard key signatures.
public enum KeySignatureAccidentalType: String, Sendable, Hashable {
    case sharp = "SHARP"
    case flat = "FLAT"
    case natural = "NATURAL"
}
