import SwiftUI

/// Key signature display with musical staff notation and key selection controls
struct KeySignatureView: View {
    @Bindable var settings: SettingsViewModel
    var notes: NotesViewModel?
    
    // Staff line positions (from bottom to top: E4, G4, B4, D5, F5)
    private let staffLinePositions: [CGFloat] = [80, 60, 40, 20, 0]
    
    // Accidental positions on the staff for sharp/flat placement
    // These are the standard positions for accidentals in key signatures
    private let sharpStaffPositions: [CGFloat] = [-10, 10, -20, 0, 20, -10, 10] // F, C, G, D, A, E, B
    private let flatStaffPositions: [CGFloat] = [10, -10, 20, 0, 30, 10, 20] // B, E, A, D, G, C, F
    
    var body: some View {
        VStack(spacing: 8) {
            // Key Pickers
            HStack {
                Picker("Tonic", selection: $settings.tonic) {
                    ForEach(settings.availableTonicNotes, id: \.self) { note in
                        Text(settings.noteLabel(for: note).description)
                            .tag(note)
                    }
                }
                .pickerStyle(.menu)
                
                Picker("Tonality", selection: $settings.tonality) {
                    ForEach(settings.availableTonalities, id: \.self) { tonality in
                        Text(tonality.displayName)
                            .tag(tonality)
                    }
                }
                .pickerStyle(.menu)
            }
            .font(.subheadline)
            
            // Musical staff with key signature
            ZStack {
                // Staff lines
                VStack(spacing: 20) {
                    ForEach(0..<5, id: \.self) { _ in
                        Rectangle()
                            .fill(Color.primary)
                            .frame(height: 1)
                    }
                }
                .frame(width: 200, height: 80)
                
                // Treble clef
                Text("𝄞")
                    .font(.system(size: 70))
                    .offset(x: -70, y: 10)
                
                // Accidentals
                if let keySignature = settings.keySignature {
                    HStack(spacing: 4) {
                        ForEach(0..<keySignature.accidentals.count, id: \.self) { index in
                            Text(accidentalSymbol)
                                .font(.system(size: 24))
                                .offset(y: accidentalOffset(at: index))
                        }
                    }
                    .offset(x: -20)
                }
            }
            .frame(height: 120)
            
            // Play Scale button
            if let notes = notes {
                Button(action: {
                    notes.playScale(baseOctave: settings.baseOctave)
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: notes.isPlayingScale ? "stop.fill" : "play.fill")
                        Text(notes.isPlayingScale ? "Playing..." : "Play Scale")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(notes.isPlayingScale ? Color.gray : Color.accentColor)
                    .cornerRadius(8)
                }
                .buttonStyle(.plain)
                .disabled(notes.isPlayingScale)
            }
        }
        .padding()
    }
    
    private var accidentalSymbol: String {
        switch settings.keySignature?.accidentalType {
        case .sharp:
            return "♯"
        case .flat:
            return "♭"
        default:
            return ""
        }
    }
    
    private func accidentalOffset(at index: Int) -> CGFloat {
        guard let keySignature = settings.keySignature else { return 0 }
        
        let positions = keySignature.accidentalType == .sharp ? sharpStaffPositions : flatStaffPositions
        
        guard index < positions.count else { return 0 }
        return positions[index]
    }
}

#Preview {
    let settings = SettingsViewModel()
    let notes = NotesViewModel(settings: settings)
    
    return KeySignatureView(settings: settings, notes: notes)
}
