import Foundation

/// Provides functionality for calculating key signatures
public struct KeySignatureCalculator {
    
    /// The order in which sharps appear in key signatures.
    /// Based on the circle of fifths, each new sharp key adds the next sharp in this sequence.
    /// Order: F#, C#, G#, D#, A#, E#, B#
    public static let sharpOrder: [Note] = [.f, .c, .g, .d, .a, .e, .b]
    
    /// The order in which flats appear in key signatures.
    /// Order: B♭, E♭, A♭, D♭, G♭, C♭, F♭
    public static let flatOrder: [Note] = [.b, .e, .a, .d, .g, .c, .f]
    
    /// Range of circle of fifths positions that typically use sharp key signatures
    private static let sharpKeyRange = 1...4
    
    /// Range of circle of fifths positions that typically use flat key signatures
    private static let flatKeyRange = 8...11
    
    /// Cache for computed key signatures
    private static var cache: [String: [KeySignature]] = [:]
    
    /// Generates all possible key signatures for a given tonic and tonality
    /// Results are cached to improve performance.
    /// - Parameters:
    ///   - tonic: The root note of the desired key
    ///   - tonality: The scale type (Major, Minor Natural, etc.)
    /// - Returns: Array of key signature objects, sorted by preference
    public static func getKeySignatures(tonic: Note, tonality: Tonality) -> [KeySignature] {
        let cacheKey = "\(tonic.rawValue)-\(tonality.rawValue)"
        
        if let cached = cache[cacheKey] {
            return cached
        }
        
        let result = calculateKeySignatures(tonic: tonic, tonality: tonality)
        cache[cacheKey] = result
        return result
    }
    
    /// Core key signature calculation logic
    private static func calculateKeySignatures(tonic: Note, tonality: Tonality) -> [KeySignature] {
        // Convert minor keys to their relative major for circle of fifths lookup
        var adjustedTonic = tonic
        if tonality != .major {
            adjustedTonic = Note(wrapping: tonic.rawValue + 3)
        }
        
        guard let index = Note.circleOfFifths.firstIndex(of: adjustedTonic) else {
            fatalError("Tonic \(adjustedTonic) not found in circle of fifths")
        }
        
        var keySignatures: [KeySignature] = []
        let scaleNotes = ScaleBuilder.buildScale(tonic: tonic, tonality: tonality)
        
        // Determine whether this key uses sharps, flats, or both
        let accidentalTypes = determineAccidentalTypes(circleOfFifthsIndex: index)
        
        // Generate key signature(s) for each accidental type
        for type in accidentalTypes {
            let accidentalsList = calculateAccidentalsList(accidentalType: type, circleOfFifthsIndex: index)
            let labels = NoteLabeling.getScaleLabels(
                scaleNotes: scaleNotes,
                tonic: tonic,
                accidentalType: type,
                tonality: tonality
            )
            
            keySignatures.append(KeySignature(
                tonic: tonic,
                tonicLabel: labels[0],
                tonality: tonality,
                accidentals: accidentalsList,
                accidentalType: type,
                scaleAscending: Sequence(notes: scaleNotes, labels: labels)
            ))
        }
        
        return sortKeySignatures(keySignatures)
    }
    
    /// Determines whether a key should use sharps or flats based on its circle of fifths position
    private static func determineAccidentalTypes(circleOfFifthsIndex: Int) -> [KeySignatureAccidentalType] {
        if circleOfFifthsIndex == 0 {
            return [.natural]
        }
        if sharpKeyRange.contains(circleOfFifthsIndex) {
            return [.sharp]
        }
        if flatKeyRange.contains(circleOfFifthsIndex) {
            return [.flat]
        }
        // Enharmonic keys (positions 5-7) can use either
        return [.flat, .sharp]
    }
    
    /// Calculates which specific accidentals appear in a key signature
    private static func calculateAccidentalsList(
        accidentalType: KeySignatureAccidentalType,
        circleOfFifthsIndex: Int
    ) -> [Note] {
        switch accidentalType {
        case .flat:
            return Array(flatOrder.prefix(12 - circleOfFifthsIndex))
        case .sharp:
            return Array(sharpOrder.prefix(circleOfFifthsIndex))
        case .natural:
            return []
        }
    }
    
    /// Sorts key signatures by preference (fewer accidentals first, flats over sharps)
    private static func sortKeySignatures(_ keySignatures: [KeySignature]) -> [KeySignature] {
        keySignatures.sorted { a, b in
            if a.accidentals.count != b.accidentals.count {
                return a.accidentals.count < b.accidentals.count
            }
            return a.accidentalType == .flat
        }
    }
}
