import Foundation

/// Represents a musical note as an integer from 0-11.
/// Uses chromatic numbering where C=0, C#/Db=1, D=2, etc.
///
/// This is the fundamental building block for all music theory operations.
/// Each integer represents a pitch class (notes in all octaves with the same name).
public enum Note: Int, CaseIterable, Sendable, Codable, Hashable {
    case c = 0
    case cSharp = 1
    case d = 2
    case dSharp = 3
    case e = 4
    case f = 5
    case fSharp = 6
    case g = 7
    case gSharp = 8
    case a = 9
    case aSharp = 10
    case b = 11
    
    /// All 12 chromatic notes in order
    public static let all: [Note] = Note.allCases
    
    /// Pre-computed circle of fifths as an array of Note values.
    /// Order: C, G, D, A, E, B, F#/Gb, C#/Db, G#/Ab, D#/Eb, A#/Bb, F
    public static let circleOfFifths: [Note] = (0..<12).map { i in
        Note(rawValue: (i * Interval.perfectFifth.semitones) % 12)!
    }
    
    /// Creates a Note from an integer, wrapping around octaves using modulo 12
    /// - Parameter value: Any integer value (will be wrapped to 0-11)
    public init(wrapping value: Int) {
        var wrapped = value % 12
        if wrapped < 0 {
            wrapped += 12
        }
        self = Note(rawValue: wrapped)!
    }
    
    /// Transposes this note by a given interval
    /// - Parameter interval: The interval to add (in semitones)
    /// - Returns: The resulting note after adding the interval
    public func transposed(by semitones: Int) -> Note {
        Note(wrapping: rawValue + semitones)
    }
    
    /// Transposes this note by a given interval
    /// - Parameter interval: The interval to transpose by
    /// - Returns: The resulting note after transposition
    public func transposed(by interval: Interval) -> Note {
        transposed(by: interval.semitones)
    }
    
    /// Calculates the interval from this note to another note
    /// Returns the shortest interval within one octave (0-11 semitones)
    /// - Parameter other: The target note
    /// - Returns: The interval in semitones (0-11)
    public func interval(to other: Note) -> Int {
        (other.rawValue - rawValue + 12) % 12
    }
    
    /// Calculates the semitone difference between an actual note and its natural letter position.
    /// The difference indicates what accidental is needed:
    /// - 0: Natural (no accidental needed)
    /// - +1: Sharp needed
    /// - -1: Flat needed
    /// - +2: Double sharp needed
    /// - -2: Double flat needed
    public func difference(from naturalNote: Note) -> Int {
        var diff = rawValue - naturalNote.rawValue
        
        // Handle cross-octave wrapping: ensure difference is in range [-2, +2]
        if diff > 2 {
            diff = (diff - 12) % 12
        } else if diff < -2 {
            diff = (diff + 12) % 12
        }
        
        return diff
    }
}

// MARK: - CustomStringConvertible

extension Note: CustomStringConvertible {
    public var description: String {
        switch self {
        case .c: return "C"
        case .cSharp: return "C#"
        case .d: return "D"
        case .dSharp: return "D#"
        case .e: return "E"
        case .f: return "F"
        case .fSharp: return "F#"
        case .g: return "G"
        case .gSharp: return "G#"
        case .a: return "A"
        case .aSharp: return "A#"
        case .b: return "B"
        }
    }
}
