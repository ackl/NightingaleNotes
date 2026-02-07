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
        GeometryReader { geometry in
            let isPortrait = geometry.size.height >= geometry.size.width

            Group {
                if isPortrait {
                    portraitLayout(in: geometry.size)
                } else {
                    landscapeLayout(in: geometry.size)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Menu {
                    Button(action: {
                        settings.showLabels.toggle()
                    }) {
                        Label(
                            settings.showLabels ? "Hide Labels" : "Show Labels",
                            systemImage: settings.showLabels ? "tag.slash" : "tag"
                        )
                    }

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
            notes.settings = settings
            AudioEngine.shared.prepare()
        }
        .onChange(of: settings.tonic) { _, _ in
            notes.clearChord()
        }
        .onChange(of: settings.tonality) { _, _ in
            notes.clearChord()
        }
    }

    private func portraitLayout(in size: CGSize) -> some View {
        let keyboardZoneHeight = max(280, size.height * 0.56)

        return VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    KeySignatureView(settings: settings, notes: notes)
                        .padding(.horizontal, 8)

                    DiatonicChordsView(notes: notes, settings: settings, compactLayout: true)
                        .padding(.horizontal, 8)
                }
                .padding(.top, 8)
                .padding(.bottom, 12)
            }

            Divider()

            VStack(spacing: 10) {
                KeyboardView(notes: notes, settings: settings, compactSizing: true, showMinimap: true)
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, 8)
            }
            .frame(height: keyboardZoneHeight)
            .background(Color.primary.opacity(0.03))
        }
    }

    private func landscapeLayout(in size: CGSize) -> some View {
        HStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    KeySignatureView(settings: settings, notes: notes)
                    DiatonicChordsView(notes: notes, settings: settings, compactLayout: false)
                }
                .padding()
            }
            .frame(width: min(360, size.width * 0.4))

            Divider()

            VStack(spacing: 10) {
                KeyboardView(notes: notes, settings: settings, compactSizing: false, showMinimap: false)
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, 10)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

#Preview {
    MainView()
}
