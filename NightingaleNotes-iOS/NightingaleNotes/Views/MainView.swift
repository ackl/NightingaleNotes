import SwiftUI

/// Main view for NightingaleNotes app
struct MainView: View {
    @State private var settings = SettingsViewModel()
    @State private var notes: NotesViewModel
    
    init() {
        let settingsVM = SettingsViewModel()
        _settings = State(initialValue: settingsVM)
        _notes = State(initialValue: NotesViewModel(settings: settingsVM))
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Key Signature Display with Pickers
                KeySignatureView(settings: settings)
                    .frame(maxWidth: .infinity)
                
                // Diatonic Chords
                DiatonicChordsView(notes: notes, settings: settings)
                
                // Piano Keyboard
                KeyboardView(notes: notes, settings: settings)
                    .frame(height: 200)
                
                Spacer(minLength: 40)
            }
            .padding(.top)
        }
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Menu {
                    // Show Labels toggle
                    Button(action: {
                        settings.showLabels.toggle()
                    }) {
                        Label(
                            settings.showLabels ? "Hide Labels" : "Show Labels",
                            systemImage: settings.showLabels ? "tag.slash" : "tag"
                        )
                    }
                    
                    // Only In Key toggle (only when showLabels is true)
                    if settings.showLabels {
                        Button(action: {
                            settings.onlyInKey.toggle()
                        }) {
                            Label(
                                settings.onlyInKey ? "Show All Notes" : "Only In Key",
                                systemImage: settings.onlyInKey ? "music.note.list" : "music.note"
                            )
                        }
                    }
                    
                    Divider()
                    
                    // Octaves controls
                    Text("Octaves: \(settings.octaves)")
                    
                    Button(action: {
                        settings.increaseOctaves()
                    }) {
                        Label("Add Octave", systemImage: "plus")
                    }
                    
                    Button(action: {
                        settings.decreaseOctaves()
                    }) {
                        Label("Remove Octave", systemImage: "minus")
                    }
                } label: {
                    Image(systemName: "gearshape")
                }
            }
        }
        .onAppear {
            // Update notes view model reference when settings change
            notes.settings = settings
            
            // Prepare audio engine
            AudioEngine.shared.prepare()
        }
        .onChange(of: settings.tonic) { _, _ in
            notes.clearChord()
        }
        .onChange(of: settings.tonality) { _, _ in
            notes.clearChord()
        }
    }
}

#Preview {
    MainView()
}
