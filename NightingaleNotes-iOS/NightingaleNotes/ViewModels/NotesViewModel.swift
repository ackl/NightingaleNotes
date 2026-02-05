import Foundation
import SwiftUI

/// ViewModel for managing notes, chords, and musical state
@MainActor
@Observable
public class NotesViewModel {
    
    /// Structure to track a specific note playing in a specific octave
    public struct PlayingNote: Hashable {
        public let note: Note
        public let octave: Int
        
        public init(note: Note, octave: Int) {
            self.note = note
            self.octave = octave
        }
    }
    
    /// Reference to the settings view model
    public var settings: SettingsViewModel
    
    /// The currently selected diatonic chord (nil if no chord selected)
    public var selectedChordDegree: Int? = nil
    
    /// The notes of the currently selected chord
    public var chordNotes: [Note] = []
    
    /// The root note of the selected chord
    public var chordRoot: Note? = nil
    
    /// The type of the selected chord
    public var chordType: ChordType? = nil
    
    /// Notes currently being played (for highlighting)
    public var playingNotes: Set<PlayingNote> = []
    
    /// The diatonic chord types for the current tonality
    public var diatonicChordTypes: [ChordType] {
        DiatonicChordMaps.chordTypes(for: settings.tonality)
    }
    
    /// The Roman numerals for the current tonality
    public var romanNumerals: [String] {
        RomanNumerals.getRomanNumerals(for: settings.tonality)
    }
    
    public init(settings: SettingsViewModel) {
        self.settings = settings
    }
    
    /// Selects a diatonic chord by its degree (0-6)
    /// - Parameter degree: The scale degree (0 = tonic, 1 = supertonic, etc.)
    public func selectChord(degree: Int) {
        guard degree >= 0, degree < 7 else {
            clearChord()
            return
        }
        
        // Toggle off if same chord is selected
        if selectedChordDegree == degree {
            clearChord()
            return
        }
        
        selectedChordDegree = degree
        
        // Get the chord root from the scale
        let scaleNotes = settings.scaleNotes
        guard degree < scaleNotes.count else {
            clearChord()
            return
        }
        
        chordRoot = scaleNotes[degree]
        chordType = diatonicChordTypes[degree]
        
        // Build the chord
        if let root = chordRoot, let type = chordType {
            chordNotes = ChordBuilder.buildChord(root: root, chordType: type)
        }
    }
    
    /// Clears the currently selected chord
    public func clearChord() {
        selectedChordDegree = nil
        chordNotes = []
        chordRoot = nil
        chordType = nil
    }
    
    /// Checks if a note is part of the currently selected chord
    public func isNoteInChord(_ note: Note) -> Bool {
        chordNotes.contains(note)
    }
    
    /// Checks if a note should be highlighted
    /// - Parameters:
    ///   - note: The note to check
    ///   - considerScale: Whether to consider scale membership
    /// - Returns: True if the note should be highlighted
    public func shouldHighlightNote(_ note: Note, considerScale: Bool = true) -> Bool {
        // If a chord is selected, highlight chord notes
        if !chordNotes.isEmpty {
            return isNoteInChord(note)
        }
        
        // Otherwise, always highlight scale notes (onlyInKey only affects labels, not highlighting)
        if considerScale {
            return settings.isNoteInScale(note)
        }
        
        return false
    }
    
    /// Gets the label for a chord degree
    public func chordLabel(for degree: Int) -> String {
        guard degree >= 0, degree < romanNumerals.count else {
            return ""
        }
        return romanNumerals[degree]
    }
    
    /// Gets the full chord name (e.g., "C Major", "Am")
    public func fullChordName(for degree: Int) -> String {
        guard degree >= 0,
              degree < settings.scaleNotes.count,
              degree < settings.scaleLabels.count,
              degree < diatonicChordTypes.count else {
            return ""
        }
        
        let rootLabel = settings.scaleLabels[degree]
        let type = diatonicChordTypes[degree]
        
        return "\(rootLabel)\(type.symbol)"
    }
    
    /// Play a note
    public func playNote(_ note: Note, octave: Int = 4) {
        let playingNote = PlayingNote(note: note, octave: octave)
        playingNotes.insert(playingNote)
        AudioEngine.shared.playNote(note, octave: octave)
        
        // Remove from playing notes after a delay
        Task {
            try? await Task.sleep(for: .milliseconds(500))
            playingNotes.remove(playingNote)
        }
    }
    
    /// Play the currently selected chord
    public func playCurrentChord(octave: Int = 4) {
        guard !chordNotes.isEmpty else { return }
        
        let chordPlayingNotes = chordNotes.map { PlayingNote(note: $0, octave: octave) }
        
        for playingNote in chordPlayingNotes {
            playingNotes.insert(playingNote)
        }
        
        AudioEngine.shared.playChord(chordNotes, octave: octave)
        
        // Remove from playing notes after a delay
        Task {
            try? await Task.sleep(for: .milliseconds(800))
            for playingNote in chordPlayingNotes {
                playingNotes.remove(playingNote)
            }
        }
    }
}
