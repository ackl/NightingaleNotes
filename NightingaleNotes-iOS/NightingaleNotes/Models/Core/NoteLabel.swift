import Foundation

/// The seven natural note names in Western music
public enum NoteLabelBase: String, CaseIterable, Sendable, Hashable {
    case c = "C"
    case d = "D"
    case e = "E"
    case f = "F"
    case g = "G"
    case a = "A"
    case b = "B"
    
    /// All note labels in order (C, D, E, F, G, A, B)
    public static let inOrder: [NoteLabelBase] = [.c, .d, .e, .f, .g, .a, .b]
    
    /// The natural notes (white keys) as Note values
    /// C=0, D=2, E=4, F=5, G=7, A=9, B=11
    public static let naturalNotes: [Note] = [.c, .d, .e, .f, .g, .a, .b]
    
    /// Returns the Note value for this natural note letter
    public var note: Note {
        switch self {
        case .c: return .c
        case .d: return .d
        case .e: return .e
        case .f: return .f
        case .g: return .g
        case .a: return .a
        case .b: return .b
        }
    }
    
    /// Returns an array of note labels starting from this letter
    /// - Returns: Array of 7 note letters in alphabetical order
    public func lettersStartingHere() -> [NoteLabelBase] {
        guard let startIndex = NoteLabelBase.inOrder.firstIndex(of: self) else {
            return NoteLabelBase.inOrder
        }
        return Array(NoteLabelBase.inOrder[startIndex...]) + Array(NoteLabelBase.inOrder[..<startIndex])
    }
}

/// Represents a complete note label (base letter with optional accidental)
public struct NoteLabel: Sendable, Hashable, CustomStringConvertible {
    public let base: NoteLabelBase
    public let accidental: String // The symbol (♯, ♭, etc.) or empty string
    
    public init(base: NoteLabelBase, accidental: String = "") {
        self.base = base
        self.accidental = accidental
    }
    
    public init(base: NoteLabelBase, accidentalType: Accidental?) {
        self.base = base
        self.accidental = accidentalType?.symbol ?? ""
    }
    
    public var description: String {
        "\(base.rawValue)\(accidental)"
    }
    
    /// Creates a NoteLabel from a string like "C", "F♯", "B♭"
    public static func from(_ string: String) -> NoteLabel? {
        guard let firstChar = string.first,
              let base = NoteLabelBase(rawValue: String(firstChar).uppercased()) else {
            return nil
        }
        
        let accidental = String(string.dropFirst())
        return NoteLabel(base: base, accidental: accidental)
    }
}

/// Represents a musical sequence with both numeric and label representations.
/// Used for scales, chords, and other musical collections.
public struct Sequence: Sendable, Hashable {
    /// Array of note values (0-11)
    public let notes: [Note]
    /// Array of corresponding note labels
    public let labels: [NoteLabel]
    
    public init(notes: [Note], labels: [NoteLabel]) {
        self.notes = notes
        self.labels = labels
    }
}
