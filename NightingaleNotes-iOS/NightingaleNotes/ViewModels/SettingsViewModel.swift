import Foundation
import SwiftUI

/// ViewModel for managing app settings and user preferences
@MainActor
@Observable
public class SettingsViewModel {
    
    /// The currently selected tonic note
    public var tonic: Note = .c {
        didSet { updateKeySignature() }
    }
    
    /// The currently selected tonality
    public var tonality: Tonality = .major {
        didSet { updateKeySignature() }
    }
    
    /// Number of octaves to display on the keyboard (matches original: 2-4 range)
    public var octaves: Int = 2
    
    /// Base octave for audio playback (internal, not user-configurable)
    public let baseOctave: Int = 4
    
    /// Whether to show note labels on the keyboard
    public var showLabels: Bool = true
    
    /// Whether to only highlight notes in the current key
    public var onlyInKey: Bool = true
    
    /// Whether to show seventh chord options
    public var showSeventhChords: Bool = false
    
    /// The current key signature
    public private(set) var keySignature: KeySignature?
    
    /// Available key signatures (for enharmonic keys, there may be multiple)
    public private(set) var keySignatures: [KeySignature] = []
    
    /// The scale notes for the current key
    public var scaleNotes: [Note] {
        keySignature?.scaleAscending.notes ?? []
    }
    
    /// The scale labels for the current key
    public var scaleLabels: [NoteLabel] {
        keySignature?.scaleAscending.labels ?? []
    }
    
    /// All available tonic notes
    public let availableTonicNotes: [Note] = Note.allCases
    
    /// All available tonalities
    public let availableTonalities: [Tonality] = Tonality.allCases
    
    public init() {
        updateKeySignature()
    }
    
    /// Updates the key signature based on current tonic and tonality
    private func updateKeySignature() {
        keySignatures = KeySignatureCalculator.getKeySignatures(tonic: tonic, tonality: tonality)
        keySignature = keySignatures.first
    }
    
    /// Gets the display label for a note based on current key signature
    public func noteLabel(for note: Note) -> NoteLabel {
        // If the note is in the current scale, use the scale-specific label
        // This ensures natural signs are shown for raised 6th/7th in harmonic/melodic minor
        if let index = scaleNotes.firstIndex(of: note) {
            return scaleLabels[index]
        }
        
        // For notes outside the scale, use chromatic labels
        let accidentalType = keySignature?.accidentalType ?? .natural
        let chromaticLabels = NoteLabeling.getChromaticNoteLabels(accidentalType: accidentalType)
        return chromaticLabels[note.rawValue]
    }
    
    /// Checks if a note is in the current scale
    public func isNoteInScale(_ note: Note) -> Bool {
        scaleNotes.contains(note)
    }
    
    /// Gets the tonic display label
    public var tonicLabel: String {
        keySignature?.tonicLabel.description ?? tonic.description
    }
    
    /// Gets the full key name (e.g., "C Major", "A Minor Natural")
    public var keyName: String {
        "\(tonicLabel) \(tonality.displayName)"
    }
    
    /// Increases the number of octaves (max 4)
    public func increaseOctaves() {
        if octaves < 4 {
            octaves += 1
        }
    }
    
    /// Decreases the number of octaves (min 2)
    public func decreaseOctaves() {
        if octaves > 2 {
            octaves -= 1
        }
    }
}
