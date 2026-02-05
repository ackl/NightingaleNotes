import Foundation

/// Provides functionality for building and analyzing chords
public struct ChordBuilder {
    
    /// Constructs a chord by combining a root note with a chord type
    /// - Parameters:
    ///   - root: The root note of the chord
    ///   - chordType: The type of chord to build
    /// - Returns: Array of notes that make up the chord
    public static func buildChord(root: Note, chordType: ChordType) -> [Note] {
        chordType.intervals.map { interval in
            root.transposed(by: interval)
        }
    }
    
    /// Transposes an entire chord by a given interval
    /// - Parameters:
    ///   - chord: Array of notes representing the chord
    ///   - semitones: The interval to transpose by (in semitones)
    /// - Returns: New array of transposed notes
    public static func transposeChord(_ chord: [Note], by semitones: Int) -> [Note] {
        chord.map { $0.transposed(by: semitones) }
    }
    
    /// Generates all possible chord inversions for a given chord
    /// - Parameter chord: Array of notes representing the chord
    /// - Returns: Array of arrays, each representing a different inversion
    public static func generateInversions(_ chord: [Note]) -> [[Note]] {
        var inversions: [[Note]] = []
        
        for i in 0..<chord.count {
            let inversion = Array(chord[i...]) + Array(chord[..<i])
            inversions.append(inversion)
        }
        
        return inversions
    }
    
    /// Calculates the diatonic chord types for a given scale
    /// - Parameters:
    ///   - scale: Array of 7 notes representing the scale
    ///   - includeSeventh: Whether to include seventh chords
    /// - Returns: Array of chord types for each degree of the scale
    public static func calculateDiatonicChordTypes(scale: [Note], includeSeventh: Bool = false) -> [ChordType] {
        guard scale.count == 7 else {
            fatalError("Scale must contain exactly 7 notes")
        }
        
        return scale.indices.map { i in
            // Get chord tones: 1st, 3rd, 5th, and optionally 7th degrees from the scale
            let root = scale[i]
            let third = scale[(i + 2) % 7]
            let fifth = scale[(i + 4) % 7]
            let seventh = includeSeventh ? scale[(i + 6) % 7] : nil
            
            // Calculate intervals in semitones (handling octave wrapping)
            let thirdInterval = (third.rawValue - root.rawValue + 12) % 12
            let fifthInterval = (fifth.rawValue - root.rawValue + 12) % 12
            let seventhInterval = seventh.map { ($0.rawValue - root.rawValue + 12) % 12 }
            
            return determineChordType(
                thirdInterval: thirdInterval,
                fifthInterval: fifthInterval,
                seventhInterval: seventhInterval,
                includeSeventh: includeSeventh
            )
        }
    }
    
    /// Determines chord type from interval pattern
    private static func determineChordType(
        thirdInterval: Int,
        fifthInterval: Int,
        seventhInterval: Int?,
        includeSeventh: Bool
    ) -> ChordType {
        if includeSeventh, let seventh = seventhInterval {
            // Seventh chord patterns
            switch (thirdInterval, fifthInterval, seventh) {
            case (Interval.M3, Interval.P5, Interval.M7):
                return .majorSeventh
            case (Interval.M3, Interval.P5, Interval.m7):
                return .dominantSeventh
            case (Interval.m3, Interval.P5, Interval.m7):
                return .minorSeventh
            case (Interval.m3, Interval.P5, Interval.M7):
                return .minorMajorSeventh
            case (Interval.m3, Interval.d5, Interval.m7):
                return .halfDiminishedSeventh
            case (Interval.m3, Interval.d5, Interval.d7):
                return .fullyDiminishedSeventh
            case (Interval.M3, Interval.A5, Interval.M7):
                return .augmentedMajorSeventh
            case (Interval.M3, Interval.A5, Interval.m7):
                return .augmentedDominantSeventh
            default:
                break
            }
        }
        
        // Triad patterns
        switch (thirdInterval, fifthInterval) {
        case (Interval.M3, Interval.P5):
            return .major
        case (Interval.m3, Interval.P5):
            return .minor
        case (Interval.m3, Interval.d5):
            return .diminished
        case (Interval.M3, Interval.A5):
            return .augmented
        default:
            return .major // Fallback
        }
    }
    
    /// Gets the diatonic chord types for a given tonality
    /// - Parameters:
    ///   - tonality: The scale type
    ///   - includeSeventh: Whether to include seventh chords
    /// - Returns: Array of chord types for the seven diatonic degrees
    public static func getDiatonicChordTypes(for tonality: Tonality, includeSeventh: Bool = false) -> [ChordType] {
        // For natural minor, use the relative major pattern shifted to start from the 6th degree
        if tonality == .minorNatural {
            let majorPattern = getDiatonicChordTypes(for: .major, includeSeventh: includeSeventh)
            return wrapArray(majorPattern, by: 5)
        }
        
        // For all other tonalities, build the scale and calculate chord qualities
        let scale = ScaleBuilder.buildScale(tonic: .c, tonality: tonality)
        return calculateDiatonicChordTypes(scale: scale, includeSeventh: includeSeventh)
    }
    
    /// Helper to wrap an array by shifting elements
    private static func wrapArray<T>(_ array: [T], by offset: Int) -> [T] {
        guard !array.isEmpty else { return array }
        let normalizedOffset = ((offset % array.count) + array.count) % array.count
        return Array(array[normalizedOffset...]) + Array(array[..<normalizedOffset])
    }
}

// MARK: - Diatonic Chord Maps

/// Pre-computed diatonic chord types for each tonality
public struct DiatonicChordMaps {
    public static let major: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .major)
    public static let minorNatural: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorNatural)
    public static let minorHarmonic: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorHarmonic)
    public static let minorMelodic: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorMelodic)
    
    public static func chordTypes(for tonality: Tonality) -> [ChordType] {
        switch tonality {
        case .major: return major
        case .minorNatural: return minorNatural
        case .minorHarmonic: return minorHarmonic
        case .minorMelodic: return minorMelodic
        }
    }
    
    public static let majorSevenths: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .major, includeSeventh: true)
    public static let minorNaturalSevenths: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorNatural, includeSeventh: true)
    public static let minorHarmonicSevenths: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorHarmonic, includeSeventh: true)
    public static let minorMelodicSevenths: [ChordType] = ChordBuilder.getDiatonicChordTypes(for: .minorMelodic, includeSeventh: true)
    
    public static func seventhChordTypes(for tonality: Tonality) -> [ChordType] {
        switch tonality {
        case .major: return majorSevenths
        case .minorNatural: return minorNaturalSevenths
        case .minorHarmonic: return minorHarmonicSevenths
        case .minorMelodic: return minorMelodicSevenths
        }
    }
}
