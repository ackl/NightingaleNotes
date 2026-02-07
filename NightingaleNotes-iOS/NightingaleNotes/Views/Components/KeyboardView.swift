import SwiftUI

/// Pastel color palette for octaves
enum OctaveColors {
    static let palette: [Color] = [
        Color(red: 1.0, green: 0.82, blue: 0.86),   // Pastel Pink (C4)
        Color(red: 1.0, green: 0.93, blue: 0.82),   // Pastel Peach (C5)
        Color(red: 0.83, green: 0.94, blue: 0.86),  // Pastel Mint (C6)
        Color(red: 0.89, green: 0.83, blue: 0.94),  // Pastel Lavender (C7)
    ]
    
    /// Darker versions of the palette colors for indicator bars (iOS 17 compatible)
    static let darkPalette: [Color] = [
        Color(red: 0.7, green: 0.57, blue: 0.60),   // Dark Pink (C4)
        Color(red: 0.7, green: 0.65, blue: 0.57),   // Dark Peach (C5)
        Color(red: 0.58, green: 0.66, blue: 0.60),  // Dark Mint (C6)
        Color(red: 0.62, green: 0.58, blue: 0.66),  // Dark Lavender (C7)
    ]
    
    static func color(for octaveIndex: Int) -> Color {
        let index = octaveIndex % palette.count
        return palette[index]
    }
    
    static func darkColor(for octaveIndex: Int) -> Color {
        let index = octaveIndex % darkPalette.count
        return darkPalette[index]
    }
}

struct KeyboardMetrics {
    let whiteKeyWidth: CGFloat
    let whiteKeyHeight: CGFloat
    let blackKeyWidth: CGFloat
    let blackKeyHeight: CGFloat
    let whiteKeySpacing: CGFloat
    let horizontalPadding: CGFloat

    static let compact = KeyboardMetrics(
        whiteKeyWidth: 34,
        whiteKeyHeight: 132,
        blackKeyWidth: 22,
        blackKeyHeight: 82,
        whiteKeySpacing: 2,
        horizontalPadding: 10
    )

    static let regular = KeyboardMetrics(
        whiteKeyWidth: 44,
        whiteKeyHeight: 180,
        blackKeyWidth: 28,
        blackKeyHeight: 110,
        whiteKeySpacing: 2,
        horizontalPadding: 12
    )

    var octaveWidth: CGFloat {
        (whiteKeyWidth * 7) + (whiteKeySpacing * 6)
    }
}

private struct KeyboardContentWidthPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

private struct KeyboardViewportSizePreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

/// Individual piano key view
struct IvoryKeyView: View {
    let note: Note
    let octave: Int
    let isBlackKey: Bool
    let isHighlighted: Bool
    let isPlaying: Bool
    let showLabel: Bool
    let label: NoteLabel
    let metrics: KeyboardMetrics
    let octaveTint: Color?
    let octaveIndex: Int

    var onTap: () -> Void
    
    /// Indicator bar color for highlighted keys (in scale/chord)
    private var indicatorColor: Color {
        if isBlackKey {
            return .purple
        }
        // For white keys, use the pre-computed dark version of the octave color
        return OctaveColors.darkColor(for: octaveIndex)
    }

    var body: some View {
        let keyWidth = isBlackKey ? metrics.blackKeyWidth : metrics.whiteKeyWidth
        let keyHeight = isBlackKey ? metrics.blackKeyHeight : metrics.whiteKeyHeight

        Button(action: onTap) {
            ZStack(alignment: .bottom) {
                RoundedRectangle(cornerRadius: isBlackKey ? 4 : 6)
                    .fill(keyColor)
                    .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 2)

                RoundedRectangle(cornerRadius: isBlackKey ? 4 : 6)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)

                if showLabel {
                    VStack {
                        Spacer()
                        Text(label.description)
                            .font(.system(size: isBlackKey ? 9 : 11, weight: .medium))
                            .foregroundColor(labelColor)
                            .padding(.bottom, isBlackKey ? 6 : 8)
                    }
                }
                
                // Bottom indicator bar for highlighted keys (in scale/chord)
                if isHighlighted && !isPlaying {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(indicatorColor)
                        .frame(height: isBlackKey ? 4 : 5)
                        .padding(.horizontal, isBlackKey ? 3 : 4)
                        .padding(.bottom, isBlackKey ? 3 : 4)
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
        // Apply octave tint to white keys (regardless of highlight state)
        if !isBlackKey, let tint = octaveTint {
            return tint
        }
        // Black keys stay black
        return isBlackKey ? .black : .white
    }

    private var labelColor: Color {
        if isPlaying {
            return .white
        }
        // White keys have black labels, black keys have white labels
        return isBlackKey ? .white : .black
    }
}

/// A single octave of piano keys
struct OctaveView: View {
    let octaveIndex: Int
    let audioOctave: Int
    let notes: NotesViewModel
    let settings: SettingsViewModel
    let metrics: KeyboardMetrics
    
    private var octaveTint: Color {
        OctaveColors.color(for: octaveIndex)
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            HStack(spacing: metrics.whiteKeySpacing) {
                ForEach(whiteNotes, id: \.self) { note in
                    IvoryKeyView(
                        note: note,
                        octave: octaveIndex,
                        isBlackKey: false,
                        isHighlighted: notes.shouldHighlightNote(note),
                        isPlaying: notes.playingNotes.contains(NotesViewModel.PlayingNote(note: note, octave: audioOctave)),
                        showLabel: settings.showLabels && (!settings.onlyInKey || settings.isNoteInScale(note)),
                        label: settings.noteLabel(for: note),
                        metrics: metrics,
                        octaveTint: octaveTint,
                        octaveIndex: octaveIndex,
                        onTap: { notes.playNote(note, octave: audioOctave) }
                    )
                }
            }

            ForEach(blackKeyPlacements, id: \.note) { placement in
                IvoryKeyView(
                    note: placement.note,
                    octave: octaveIndex,
                    isBlackKey: true,
                    isHighlighted: notes.shouldHighlightNote(placement.note),
                    isPlaying: notes.playingNotes.contains(NotesViewModel.PlayingNote(note: placement.note, octave: audioOctave)),
                    showLabel: settings.showLabels && (!settings.onlyInKey || settings.isNoteInScale(placement.note)),
                    label: settings.noteLabel(for: placement.note),
                    metrics: metrics,
                    octaveTint: nil, // Black keys don't get tinted
                    octaveIndex: octaveIndex,
                    onTap: { notes.playNote(placement.note, octave: audioOctave) }
                )
                .offset(x: placement.xOffset, y: 0)
            }
        }
        .frame(width: metrics.octaveWidth, alignment: .leading)
    }

    private var whiteNotes: [Note] {
        [.c, .d, .e, .f, .g, .a, .b]
    }

    private struct BlackKeyPlacement {
        let note: Note
        let xOffset: CGFloat
    }

    private var blackKeyPlacements: [BlackKeyPlacement] {
        let step = metrics.whiteKeyWidth + metrics.whiteKeySpacing
        let whiteCenters = (0..<7).map { CGFloat($0) * step + (metrics.whiteKeyWidth / 2) }

        func midpointStart(_ leftIndex: Int, _ rightIndex: Int) -> CGFloat {
            ((whiteCenters[leftIndex] + whiteCenters[rightIndex]) / 2) - (metrics.blackKeyWidth / 2)
        }

        return [
            BlackKeyPlacement(note: .cSharp, xOffset: midpointStart(0, 1)),
            BlackKeyPlacement(note: .dSharp, xOffset: midpointStart(1, 2)),
            BlackKeyPlacement(note: .fSharp, xOffset: midpointStart(3, 4)),
            BlackKeyPlacement(note: .gSharp, xOffset: midpointStart(4, 5)),
            BlackKeyPlacement(note: .aSharp, xOffset: midpointStart(5, 6))
        ]
    }
}

/// Full keyboard view spanning multiple octaves
struct KeyboardView: View {
    let notes: NotesViewModel
    let settings: SettingsViewModel
    let compactSizing: Bool
    let showMinimap: Bool

    @State private var selectedAnchorIndex: Int?
    @State private var scrolledOctaveID: Int?
    @State private var contentWidth: CGFloat = 0
    @State private var viewportWidth: CGFloat = 0

    private var metrics: KeyboardMetrics {
        compactSizing ? .compact : .regular
    }

    /// The currently visible octave index based on scroll position
    private var currentOctaveIndex: Int {
        guard let id = scrolledOctaveID else { return 0 }
        return min(max(id, 0), max(settings.octaves - 1, 0))
    }
    
    /// Ratio of viewport width to content width (0-1)
    private var visibleOctaveRatio: CGFloat {
        guard contentWidth > 0 else { return 1 }
        return min(viewportWidth / contentWidth, 1)
    }
    
    /// Whether the keyboard is scrolled to the right edge
    private var isAtRightEdge: Bool {
        return currentOctaveIndex == settings.octaves - 1
    }

    var body: some View {
        VStack(spacing: 8) {
            // Minimap for quick octave navigation (portrait mode only)
            if showMinimap {
                // DEBUG: Show scroll tracking values
                HStack {
                    Text("ID: \(scrolledOctaveID.map(String.init) ?? "nil")")
                    Text("idx: \(currentOctaveIndex)")
                    Text("edge: \(isAtRightEdge ? "Y" : "N")")
                }
                .font(.system(size: 10, design: .monospaced))
                .foregroundColor(.red)
                
                KeyboardMinimapView(
                    octaveCount: settings.octaves,
                    baseOctave: settings.baseOctave,
                    currentPosition: CGFloat(currentOctaveIndex),
                    visibleRatio: visibleOctaveRatio,
                    isAtRightEdge: isAtRightEdge,
                    onOctaveSelected: { index in
                        scrollToOctave(index)
                    }
                )
                .padding(.bottom, 4)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 0) {
                    ForEach(0..<settings.octaves, id: \.self) { octaveIndex in
                        OctaveView(
                            octaveIndex: octaveIndex,
                            audioOctave: settings.baseOctave + octaveIndex,
                            notes: notes,
                            settings: settings,
                            metrics: metrics
                        )
                        .id(octaveIndex)
                    }
                }
                .scrollTargetLayout()
                .padding(.horizontal, metrics.horizontalPadding)
                .background(
                    GeometryReader { geo in
                        Color.clear
                            .preference(
                                key: KeyboardContentWidthPreferenceKey.self,
                                value: geo.size.width
                            )
                    }
                )
                .frame(height: metrics.whiteKeyHeight, alignment: .top)
            }
            .scrollTargetBehavior(.viewAligned)
            .scrollPosition(id: $scrolledOctaveID, anchor: .center)
            .background(
                GeometryReader { geo in
                    Color.clear
                        .preference(
                            key: KeyboardViewportSizePreferenceKey.self,
                            value: geo.size.width
                        )
                }
            )
            .onPreferenceChange(KeyboardContentWidthPreferenceKey.self) { width in
                contentWidth = width
            }
            .onPreferenceChange(KeyboardViewportSizePreferenceKey.self) { width in
                viewportWidth = width
            }
            .onAppear {
                let initial = min(max(selectedAnchorIndex ?? 0, 0), max(settings.octaves - 1, 0))
                selectedAnchorIndex = initial
                scrolledOctaveID = initial
            }
            .onChange(of: settings.octaves) { _, newValue in
                selectedAnchorIndex = min(max(selectedAnchorIndex ?? 0, 0), max(newValue - 1, 0))
                scrolledOctaveID = selectedAnchorIndex
            }
        }
        .frame(height: metrics.whiteKeyHeight + (showMinimap ? 60 : 30))
    }

    /// Scrolls to the specified octave with smooth animation
    private func scrollToOctave(_ index: Int) {
        let maxIndex = max(settings.octaves - 1, 0)
        let clamped = min(max(index, 0), maxIndex)
        
        // Update the binding with animation - this triggers smooth scroll
        withAnimation(.easeInOut(duration: 0.35)) {
            scrolledOctaveID = clamped
        }
        
        selectedAnchorIndex = clamped
    }
}

#Preview("Compact with Minimap") {
    let settings = SettingsViewModel()
    let notes = NotesViewModel(settings: settings)

    KeyboardView(notes: notes, settings: settings, compactSizing: true, showMinimap: true)
        .frame(height: 220)
}

#Preview("Regular without Minimap") {
    let settings = SettingsViewModel()
    let notes = NotesViewModel(settings: settings)

    KeyboardView(notes: notes, settings: settings, compactSizing: false, showMinimap: false)
        .frame(height: 220)
}
