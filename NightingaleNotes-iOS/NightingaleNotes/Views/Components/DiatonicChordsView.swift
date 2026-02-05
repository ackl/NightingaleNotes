import SwiftUI

/// Diatonic chord selection buttons with Roman numeral labels
struct DiatonicChordsView: View {
    @Bindable var notes: NotesViewModel
    let settings: SettingsViewModel
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Diatonic Chords")
                .font(.headline)
                .foregroundColor(.secondary)
            
            HStack(spacing: 8) {
                ForEach(0..<7, id: \.self) { degree in
                    ChordButton(
                        degree: degree,
                        romanNumeral: notes.chordLabel(for: degree),
                        chordName: notes.fullChordName(for: degree),
                        isSelected: notes.selectedChordDegree == degree,
                        onTap: {
                            notes.selectChord(degree: degree)
                        },
                        onDoubleTap: {
                            notes.selectChord(degree: degree)
                            notes.playCurrentChord(octave: settings.baseOctave)
                        }
                    )
                }
            }
            
            // Play Chord and Clear Chord buttons
            if notes.selectedChordDegree != nil {
                HStack(spacing: 12) {
                    // Play Chord button
                    Button(action: {
                        notes.playCurrentChord(octave: settings.baseOctave)
                    }) {
                        HStack {
                            Image(systemName: "play.fill")
                            Text("Play Chord")
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                    
                    // Clear Chord button
                    Button(action: {
                        notes.clearChord()
                    }) {
                        HStack {
                            Image(systemName: "xmark.circle")
                            Text("Clear")
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(Color.gray.opacity(0.3))
                        .foregroundColor(.red)
                        .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding()
    }
}

/// Individual chord button
struct ChordButton: View {
    let degree: Int
    let romanNumeral: String
    let chordName: String
    let isSelected: Bool
    let onTap: () -> Void
    let onDoubleTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                Text(romanNumeral)
                    .font(.system(size: 18, weight: .semibold))
                Text(chordName)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            .frame(width: 44, height: 60)
            .background(isSelected ? Color.accentColor : Color.gray.opacity(0.2))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            TapGesture(count: 2).onEnded { onDoubleTap() }
        )
        .accessibilityLabel("\(romanNumeral) chord, \(chordName)")
        .accessibilityHint(isSelected ? "Selected" : "Double tap to play")
    }
}

#Preview {
    let settings = SettingsViewModel()
    let notes = NotesViewModel(settings: settings)
    
    return DiatonicChordsView(notes: notes, settings: settings)
}
