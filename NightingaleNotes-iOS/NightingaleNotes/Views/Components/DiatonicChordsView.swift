import SwiftUI

/// Diatonic chord selection buttons with Roman numeral labels
struct DiatonicChordsView: View {
    @Bindable var notes: NotesViewModel
    let settings: SettingsViewModel
    let compactLayout: Bool

    init(notes: NotesViewModel, settings: SettingsViewModel, compactLayout: Bool = false) {
        self.notes = notes
        self.settings = settings
        self.compactLayout = compactLayout
    }

    var body: some View {
        VStack(spacing: 12) {
            Text("Diatonic Chords")
                .font(.headline)
                .foregroundColor(.secondary)

            if compactLayout {
                LazyVGrid(columns: compactColumns, spacing: 8) {
                    chordButtons
                }
            } else {
                HStack(spacing: 8) {
                    chordButtons
                }
            }

            if notes.selectedChordDegree != nil {
                HStack(spacing: 12) {
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

    private var compactColumns: [GridItem] {
        Array(repeating: GridItem(.flexible(minimum: 54), spacing: 8), count: 4)
    }

    @ViewBuilder
    private var chordButtons: some View {
        ForEach(0..<7, id: \.self) { degree in
            ChordButton(
                degree: degree,
                romanNumeral: notes.chordLabel(for: degree),
                chordName: notes.fullChordName(for: degree),
                isSelected: notes.selectedChordDegree == degree,
                compactLayout: compactLayout,
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
}

/// Individual chord button
struct ChordButton: View {
    let degree: Int
    let romanNumeral: String
    let chordName: String
    let isSelected: Bool
    let compactLayout: Bool
    let onTap: () -> Void
    let onDoubleTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                Text(romanNumeral)
                    .font(.system(size: compactLayout ? 16 : 18, weight: .semibold))
                Text(chordName)
                    .font(.system(size: compactLayout ? 9 : 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: compactLayout ? .infinity : 44, minHeight: compactLayout ? 54 : 60)
            .padding(.horizontal, compactLayout ? 4 : 0)
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

    return DiatonicChordsView(notes: notes, settings: settings, compactLayout: true)
}
