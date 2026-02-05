import Foundation

/// Provides functionality for labeling notes with proper enharmonic spelling
public struct NoteLabeling {
    
    /// Generates the alphabetical sequence of note letters starting from a given tonic
    /// - Parameter tonicBase: The starting note letter
    /// - Returns: Array of note letters in alphabetical order starting from tonic
    public static func getBaseLetters(tonicBase: NoteLabelBase) -> [NoteLabelBase] {
        tonicBase.lettersStartingHere()
    }
    
    /// Converts a note letter to its corresponding "white key" note
    /// - Parameter noteLabel: A natural note letter (C, D, E, F, G, A, or B)
    /// - Returns: The Note value for the white key
    public static func labelToNote(_ noteLabel: NoteLabelBase) -> Note {
        noteLabel.note
    }
    
    /// Finds the appropriate base letter and accidental for a given note within a specific key context
    /// - Parameters:
    ///   - note: The target note to spell
    ///   - accidentalType: The preferred accidental type for this key context
    /// - Returns: Tuple containing the base letter and accidental symbol
    public static func findBaseLetterAndAccidental(
        note: Note,
        accidentalType: KeySignatureAccidentalType
    ) -> (base: NoteLabelBase, accidental: String) {
        // Try flat spelling
        if accidentalType == .flat {
            for base in NoteLabelBase.inOrder {
                let naturalNote = base.note
                if (naturalNote.rawValue - 1 + 12) % 12 == note.rawValue {
                    return (base, Accidental.flat.symbol)
                }
            }
        }
        
        // Try sharp spelling
        if accidentalType == .sharp {
            for base in NoteLabelBase.inOrder {
                let naturalNote = base.note
                if (naturalNote.rawValue + 1) % 12 == note.rawValue {
                    return (base, Accidental.sharp.symbol)
                }
            }
        }
        
        // Try natural spelling
        for base in NoteLabelBase.inOrder {
            if base.note == note {
                return (base, "")
            }
        }
        
        fatalError("Cannot find base letter for note \(note)")
    }
    
    /// Determines the appropriate accidental symbol for a note based on context and scale type
    /// - Parameters:
    ///   - difference: Semitone difference from natural note (-2 to +2)
    ///   - tonality: The scale type (affects natural sign placement)
    ///   - degreeIndex: Scale degree index (used for minor key natural sign logic)
    /// - Returns: The appropriate accidental symbol or empty string
    public static func getAccidentalSymbol(
        difference: Int,
        tonality: Tonality,
        degreeIndex: Int
    ) -> String {
        if difference == 0 {
            // Major keys: no accidental needed for natural notes
            if tonality == .major {
                return ""
            }
            
            // Minor keys: show natural sign if this degree differs from natural minor
            let currentIntervals = ScaleIntervals.intervals(for: tonality)
            let naturalMinorIntervals = ScaleIntervals.minorNatural
            
            if currentIntervals[degreeIndex] != naturalMinorIntervals[degreeIndex] {
                return Accidental.natural.symbol
            }
            
            return ""
        }
        
        // Map semitone differences to accidental symbols
        switch difference {
        case 1: return Accidental.sharp.symbol
        case -1: return Accidental.flat.symbol
        case 2: return Accidental.doubleSharp.symbol
        case -2: return Accidental.doubleFlat.symbol
        default:
            fatalError("Unsupported accidental difference: \(difference)")
        }
    }
    
    /// Generates proper note labels for a scale considering key signature and tonality
    /// - Parameters:
    ///   - scaleNotes: The numeric notes of the scale
    ///   - tonic: The root note of the key
    ///   - accidentalType: Sharp/flat preference for this key
    ///   - tonality: Scale type (affects accidental placement)
    /// - Returns: Array of properly formatted note labels
    public static func getScaleLabels(
        scaleNotes: [Note],
        tonic: Note,
        accidentalType: KeySignatureAccidentalType,
        tonality: Tonality
    ) -> [NoteLabel] {
        let tonicInfo = findBaseLetterAndAccidental(note: tonic, accidentalType: accidentalType)
        let baseLetters = getBaseLetters(tonicBase: tonicInfo.base)
        
        return scaleNotes.enumerated().map { index, note in
            let baseLetter = baseLetters[index]
            let naturalNote = baseLetter.note
            let difference = note.difference(from: naturalNote)
            let accidental = getAccidentalSymbol(difference: difference, tonality: tonality, degreeIndex: index)
            return NoteLabel(base: baseLetter, accidental: accidental)
        }
    }
    
    /// Generates labels for all 12 chromatic notes based on a key signature's accidental type
    /// - Parameter accidentalType: The accidental type from the key signature
    /// - Returns: Array of 12 note labels representing the complete chromatic scale
    public static func getChromaticNoteLabels(accidentalType: KeySignatureAccidentalType) -> [NoteLabel] {
        let sharpLabels: [NoteLabel] = [
            NoteLabel(base: .c, accidental: ""),
            NoteLabel(base: .c, accidental: Accidental.sharp.symbol),
            NoteLabel(base: .d, accidental: ""),
            NoteLabel(base: .d, accidental: Accidental.sharp.symbol),
            NoteLabel(base: .e, accidental: ""),
            NoteLabel(base: .f, accidental: ""),
            NoteLabel(base: .f, accidental: Accidental.sharp.symbol),
            NoteLabel(base: .g, accidental: ""),
            NoteLabel(base: .g, accidental: Accidental.sharp.symbol),
            NoteLabel(base: .a, accidental: ""),
            NoteLabel(base: .a, accidental: Accidental.sharp.symbol),
            NoteLabel(base: .b, accidental: "")
        ]
        
        let flatLabels: [NoteLabel] = [
            NoteLabel(base: .c, accidental: ""),
            NoteLabel(base: .d, accidental: Accidental.flat.symbol),
            NoteLabel(base: .d, accidental: ""),
            NoteLabel(base: .e, accidental: Accidental.flat.symbol),
            NoteLabel(base: .e, accidental: ""),
            NoteLabel(base: .f, accidental: ""),
            NoteLabel(base: .g, accidental: Accidental.flat.symbol),
            NoteLabel(base: .g, accidental: ""),
            NoteLabel(base: .a, accidental: Accidental.flat.symbol),
            NoteLabel(base: .a, accidental: ""),
            NoteLabel(base: .b, accidental: Accidental.flat.symbol),
            NoteLabel(base: .b, accidental: "")
        ]
        
        if accidentalType == .flat {
            return flatLabels
        }
        
        return sharpLabels
    }
}
