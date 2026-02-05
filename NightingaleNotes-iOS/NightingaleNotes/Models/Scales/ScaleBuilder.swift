import Foundation

/// Provides functionality for building scales from a tonic note and tonality
public struct ScaleBuilder {
    
    /// Builds a scale by applying the tonality's interval pattern to the tonic
    /// - Parameters:
    ///   - tonic: The root note of the scale
    ///   - tonality: The scale type (Major, Minor Natural, etc.)
    ///   - ascending: Whether to build ascending (default) or descending
    /// - Returns: Array of 7 notes representing the scale
    public static func buildScale(tonic: Note, tonality: Tonality, ascending: Bool = true) -> [Note] {
        var intervals = ScaleIntervals.intervals(for: tonality)
        
        if !ascending {
            // For melodic minor descending, use natural minor intervals
            if tonality == .minorMelodic {
                intervals = ScaleIntervals.minorNatural
            }
            intervals = intervals.reversed()
        }
        
        return intervals.map { interval in
            Note(wrapping: tonic.rawValue + interval)
        }
    }
    
    /// Checks if a note is in the given scale
    /// - Parameters:
    ///   - note: The note to check
    ///   - tonic: The root note of the scale
    ///   - tonality: The scale type
    /// - Returns: True if the note is in the scale
    public static func isNoteInScale(note: Note, tonic: Note, tonality: Tonality) -> Bool {
        let scale = buildScale(tonic: tonic, tonality: tonality)
        return scale.contains(note)
    }
    
    /// Gets the scale degree of a note within a scale
    /// - Parameters:
    ///   - note: The note to find
    ///   - tonic: The root note of the scale
    ///   - tonality: The scale type
    /// - Returns: The scale degree (0-6) or nil if not in scale
    public static func scaleDegree(of note: Note, tonic: Note, tonality: Tonality) -> ScaleDegree? {
        let scale = buildScale(tonic: tonic, tonality: tonality)
        guard let index = scale.firstIndex(of: note) else {
            return nil
        }
        return ScaleDegree(rawValue: index)
    }
    
    /// Generates a sequence of notes for playback, handling octave wrapping
    /// - Parameters:
    ///   - scale: The scale notes
    ///   - octaves: Number of octaves to span
    /// - Returns: Array of note values adjusted for ascending playback
    public static func generateSequenceNotes(scale: [Note]) -> [Int] {
        guard !scale.isEmpty else { return [] }
        
        // Find the highest note and its index
        let maxNote = scale.max(by: { $0.rawValue < $1.rawValue })!
        guard let maxIdx = scale.firstIndex(of: maxNote) else { return scale.map { $0.rawValue } }
        
        // Rearrange so the array is only ascending numbers without modulo 12
        let lower = scale[0...maxIdx].map { $0.rawValue }
        let upper = scale[(maxIdx + 1)...].map { $0.rawValue + 12 }
        
        // Add the octave to complete the scale
        var sequenceNotes = lower + upper
        sequenceNotes.append(lower[0] + 12)
        
        return sequenceNotes
    }
    
    /// Builds a complete sequence spanning multiple octaves
    /// - Parameters:
    ///   - scale: The base scale notes
    ///   - octaves: Number of octaves to build
    /// - Returns: Array of note values spanning the octaves
    public static func buildWholeSequence(scale: [Note], octaves: Int) -> [Int] {
        var sequenceNotes = generateSequenceNotes(scale: scale)
        let originalLength = sequenceNotes.count
        
        for i in 2..<octaves {
            for j in 0..<originalLength {
                let noteValue = sequenceNotes[j] + 12 * (i - 1)
                if !sequenceNotes.contains(noteValue) {
                    sequenceNotes.append(noteValue)
                }
            }
        }
        
        return sequenceNotes.sorted()
    }
}
