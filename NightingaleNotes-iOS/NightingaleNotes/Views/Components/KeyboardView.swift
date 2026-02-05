import SwiftUI

/// Individual piano key view
struct IvoryKeyView: View {
    let note: Note
    let octave: Int
    let isBlackKey: Bool
    let isHighlighted: Bool
    let isPlaying: Bool
    let showLabel: Bool
    let label: NoteLabel
    
    var onTap: () -> Void
    
    // Key dimensions
    private let whiteKeyWidth: CGFloat = 44
    private let whiteKeyHeight: CGFloat = 180
    private let blackKeyWidth: CGFloat = 28
    private let blackKeyHeight: CGFloat = 110
    
    var body: some View {
        let keyWidth = isBlackKey ? blackKeyWidth : whiteKeyWidth
        let keyHeight = isBlackKey ? blackKeyHeight : whiteKeyHeight
        
        Button(action: onTap) {
            ZStack {
                // Key background
                RoundedRectangle(cornerRadius: isBlackKey ? 4 : 6)
                    .fill(keyColor)
                    .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 2)
                
                // Key border
                RoundedRectangle(cornerRadius: isBlackKey ? 4 : 6)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                
                // Note label
                if showLabel {
                    VStack {
                        Spacer()
                        Text(label.description)
                            .font(.system(size: isBlackKey ? 10 : 12, weight: .medium))
                            .foregroundColor(labelColor)
                            .padding(.bottom, 8)
                    }
                }
            }
        }
        .buttonStyle(.plain)
        .frame(width: keyWidth, height: keyHeight)
        .zIndex(isBlackKey ? 1 : 0)
        .animation(.easeInOut(duration: 0.1), value: isHighlighted)
        .animation(.easeInOut(duration: 0.1), value: isPlaying)
        .accessibilityLabel("\(label.description) \(octave)")
        .accessibilityHint(isHighlighted ? "In current scale" : "Not in current scale")
    }
    
    private var keyColor: Color {
        if isPlaying {
            return .blue.opacity(0.8)
        }
        if isHighlighted {
            return isBlackKey ? Color(red: 0.4, green: 0.2, blue: 0.6) : Color(red: 0.6, green: 0.4, blue: 0.8)
        }
        return isBlackKey ? .black : .white
    }
    
    private var labelColor: Color {
        if isPlaying || isHighlighted {
            return .white
        }
        return isBlackKey ? .white : .black
    }
}

/// A single octave of piano keys
struct OctaveView: View {
    let octaveIndex: Int  // Relative index (0, 1, 2, ...)
    let audioOctave: Int  // Actual octave for audio playback
    let notes: NotesViewModel
    let settings: SettingsViewModel
    
    // Black key offsets for proper positioning
    private let blackKeyOffsets: [Note: CGFloat] = [
        .cSharp: 30,
        .dSharp: 74,
        .fSharp: 162,
        .gSharp: 206,
        .aSharp: 250
    ]
    
    var body: some View {
        ZStack(alignment: .topLeading) {
            // White keys
            HStack(spacing: 2) {
                ForEach(whiteNotes, id: \.self) { note in
                    IvoryKeyView(
                        note: note,
                        octave: octaveIndex,
                        isBlackKey: false,
                        isHighlighted: notes.shouldHighlightNote(note),
                        isPlaying: notes.playingNotes.contains(NotesViewModel.PlayingNote(note: note, octave: audioOctave)),
                        showLabel: settings.showLabels && (!settings.onlyInKey || settings.isNoteInScale(note)),
                        label: settings.noteLabel(for: note),
                        onTap: { notes.playNote(note, octave: audioOctave) }
                    )
                }
            }
            
            // Black keys (positioned absolutely)
            ForEach(blackNotes, id: \.self) { note in
                if let offset = blackKeyOffsets[note] {
                    IvoryKeyView(
                        note: note,
                        octave: octaveIndex,
                        isBlackKey: true,
                        isHighlighted: notes.shouldHighlightNote(note),
                        isPlaying: notes.playingNotes.contains(NotesViewModel.PlayingNote(note: note, octave: audioOctave)),
                        showLabel: settings.showLabels && (!settings.onlyInKey || settings.isNoteInScale(note)),
                        label: settings.noteLabel(for: note),
                        onTap: { notes.playNote(note, octave: audioOctave) }
                    )
                    .offset(x: offset, y: 0)
                }
            }
        }
    }
    
    private var whiteNotes: [Note] {
        [.c, .d, .e, .f, .g, .a, .b]
    }
    
    private var blackNotes: [Note] {
        [.cSharp, .dSharp, .fSharp, .gSharp, .aSharp]
    }
}

/// Full keyboard view spanning multiple octaves
struct KeyboardView: View {
    let notes: NotesViewModel
    let settings: SettingsViewModel
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 0) {
                ForEach(0..<settings.octaves, id: \.self) { octaveIndex in
                    OctaveView(
                        octaveIndex: octaveIndex,
                        audioOctave: settings.baseOctave + octaveIndex,
                        notes: notes,
                        settings: settings
                    )
                }
            }
            .padding(.horizontal)
        }
    }
}

#Preview {
    let settings = SettingsViewModel()
    let notes = NotesViewModel(settings: settings)
    
    return KeyboardView(notes: notes, settings: settings)
        .frame(height: 200)
}
