import Foundation

/// Represents a complete key signature with all its properties.
/// A key signature defines which sharps or flats are active,
/// how notes should be spelled/labeled, and the resulting scale with proper enharmonic spelling.
public struct KeySignature: Sendable, Hashable {
    /// The root note of the key (0-11)
    public let tonic: Note
    /// The label for the key's tonic
    public let tonicLabel: NoteLabel
    /// The scale type (Major, Minor Natural, etc.)
    public let tonality: Tonality
    /// Array of notes that have accidentals in this key signature
    public let accidentals: [Note]
    /// Whether this key signature uses sharps, flats, or naturals
    public let accidentalType: KeySignatureAccidentalType
    /// The ascending scale with proper note labels
    public let scaleAscending: Sequence
    
    public init(
        tonic: Note,
        tonicLabel: NoteLabel,
        tonality: Tonality,
        accidentals: [Note],
        accidentalType: KeySignatureAccidentalType,
        scaleAscending: Sequence
    ) {
        self.tonic = tonic
        self.tonicLabel = tonicLabel
        self.tonality = tonality
        self.accidentals = accidentals
        self.accidentalType = accidentalType
        self.scaleAscending = scaleAscending
    }
}
