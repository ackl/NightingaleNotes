import SwiftUI

/// Individual octave segment in the minimap
private struct OctaveSegmentView: View {
    let label: String
    let isHighlighted: Bool
    let octaveColor: Color
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .fill(isHighlighted ? octaveColor : Color.gray.opacity(0.15))
                
                RoundedRectangle(cornerRadius: 6)
                    .stroke(isHighlighted ? octaveColor.opacity(0.8) : Color.gray.opacity(0.3), lineWidth: isHighlighted ? 2 : 1)
                
                Text(label)
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(isHighlighted ? .primary : .secondary)
            }
        }
        .buttonStyle(.plain)
        .animation(.easeOut(duration: 0.15), value: isHighlighted)
    }
}

/// Minimap component that displays above the keyboard in portrait mode
/// Shows octave segments and allows quick navigation by tapping
struct KeyboardMinimapView: View {
    let octaveCount: Int
    let baseOctave: Int
    let currentPosition: CGFloat
    let visibleRatio: CGFloat
    let isAtRightEdge: Bool
    let onOctaveSelected: (Int) -> Void
    
    private let segmentSpacing: CGFloat = 4
    private let minimapHeight: CGFloat = 36
    
    /// Determines which octave should be highlighted
    /// - When at the right edge, always highlight the highest octave
    /// - Otherwise, highlight the octave with the most visible keys (rounded position)
    private var activeOctaveIndex: Int {
        guard octaveCount > 0 else { return 0 }
        
        if isAtRightEdge {
            return octaveCount - 1
        }
        
        // Round to the nearest octave (the one with most visible keys)
        let rounded = Int(currentPosition.rounded())
        return min(max(rounded, 0), octaveCount - 1)
    }
    
    var body: some View {
        HStack(spacing: segmentSpacing) {
            ForEach(0..<octaveCount, id: \.self) { index in
                OctaveSegmentView(
                    label: "C\(baseOctave + index)",
                    isHighlighted: index == activeOctaveIndex,
                    octaveColor: OctaveColors.color(for: index),
                    onTap: { onOctaveSelected(index) }
                )
            }
        }
        .frame(height: minimapHeight)
        .padding(.horizontal, 12)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Keyboard navigation")
        .accessibilityHint("Tap an octave to navigate to it")
    }
}

#Preview("2 Octaves - Start") {
    VStack {
        KeyboardMinimapView(
            octaveCount: 2,
            baseOctave: 4,
            currentPosition: 0,
            visibleRatio: 0.8,
            isAtRightEdge: false,
            onOctaveSelected: { index in
                print("Selected octave \(index)")
            }
        )
        .padding()
        
        Spacer()
    }
    .background(Color(white: 0.95))
}

#Preview("4 Octaves - Middle") {
    VStack {
        KeyboardMinimapView(
            octaveCount: 4,
            baseOctave: 4,
            currentPosition: 1.5,
            visibleRatio: 0.4,
            isAtRightEdge: false,
            onOctaveSelected: { index in
                print("Selected octave \(index)")
            }
        )
        .padding()
        
        Spacer()
    }
    .background(Color(white: 0.95))
}

#Preview("3 Octaves - Right Edge") {
    VStack {
        KeyboardMinimapView(
            octaveCount: 3,
            baseOctave: 4,
            currentPosition: 2.0,
            visibleRatio: 0.5,
            isAtRightEdge: true,
            onOctaveSelected: { index in
                print("Selected octave \(index)")
            }
        )
        .padding()
        
        Spacer()
    }
    .background(Color(white: 0.95))
}
