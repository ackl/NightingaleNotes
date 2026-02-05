import Testing
@testable import NightingaleNotes

@Suite("Note Tests")
struct NoteTests {
    
    @Test("Note creation from raw value")
    func noteCreation() {
        #expect(Note.c.rawValue == 0)
        #expect(Note.cSharp.rawValue == 1)
        #expect(Note.d.rawValue == 2)
        #expect(Note.b.rawValue == 11)
    }
    
    @Test("Note wrapping handles negative values")
    func noteWrappingNegative() {
        let note = Note(wrapping: -1)
        #expect(note == .b)
        
        let note2 = Note(wrapping: -2)
        #expect(note2 == .aSharp)
    }
    
    @Test("Note wrapping handles values over 11")
    func noteWrappingOverflow() {
        let note = Note(wrapping: 12)
        #expect(note == .c)
        
        let note2 = Note(wrapping: 14)
        #expect(note2 == .d)
    }
    
    @Test("Note transposition")
    func noteTransposition() {
        // C + 7 semitones = G
        #expect(Note.c.transposed(by: 7) == .g)
        
        // G + 5 semitones = C (wrapping)
        #expect(Note.g.transposed(by: 5) == .c)
        
        // C - 1 semitone = B
        #expect(Note.c.transposed(by: -1) == .b)
    }
    
    @Test("Interval calculation")
    func intervalCalculation() {
        // C to G = 7 semitones
        #expect(Note.c.interval(to: .g) == 7)
        
        // G to C = 5 semitones (going up)
        #expect(Note.g.interval(to: .c) == 5)
        
        // B to C = 1 semitone
        #expect(Note.b.interval(to: .c) == 1)
    }
    
    @Test("Circle of fifths ordering")
    func circleOfFifths() {
        // Should be C, G, D, A, E, B, F#, C#, G#, D#, A#, F
        #expect(Note.circleOfFifths[0] == .c)
        #expect(Note.circleOfFifths[1] == .g)
        #expect(Note.circleOfFifths[2] == .d)
        #expect(Note.circleOfFifths[3] == .a)
        #expect(Note.circleOfFifths[4] == .e)
        #expect(Note.circleOfFifths[5] == .b)
        #expect(Note.circleOfFifths[6] == .fSharp)
    }
}

@Suite("Scale Builder Tests")
struct ScaleBuilderTests {
    
    @Test("C Major scale")
    func cMajorScale() {
        let scale = ScaleBuilder.buildScale(tonic: .c, tonality: .major)
        let expected: [Note] = [.c, .d, .e, .f, .g, .a, .b]
        #expect(scale == expected)
    }
    
    @Test("G Major scale")
    func gMajorScale() {
        let scale = ScaleBuilder.buildScale(tonic: .g, tonality: .major)
        let expected: [Note] = [.g, .a, .b, .c, .d, .e, .fSharp]
        #expect(scale == expected)
    }
    
    @Test("A Minor Natural scale")
    func aMinorNaturalScale() {
        let scale = ScaleBuilder.buildScale(tonic: .a, tonality: .minorNatural)
        let expected: [Note] = [.a, .b, .c, .d, .e, .f, .g]
        #expect(scale == expected)
    }
    
    @Test("A Minor Harmonic scale")
    func aMinorHarmonicScale() {
        let scale = ScaleBuilder.buildScale(tonic: .a, tonality: .minorHarmonic)
        let expected: [Note] = [.a, .b, .c, .d, .e, .f, .gSharp]
        #expect(scale == expected)
    }
}

@Suite("Chord Builder Tests")
struct ChordBuilderTests {
    
    @Test("C Major chord")
    func cMajorChord() {
        let chord = ChordBuilder.buildChord(root: .c, chordType: .major)
        let expected: [Note] = [.c, .e, .g]
        #expect(chord == expected)
    }
    
    @Test("A Minor chord")
    func aMinorChord() {
        let chord = ChordBuilder.buildChord(root: .a, chordType: .minor)
        let expected: [Note] = [.a, .c, .e]
        #expect(chord == expected)
    }
    
    @Test("G Dominant 7th chord")
    func gDominantSeventhChord() {
        let chord = ChordBuilder.buildChord(root: .g, chordType: .dominantSeventh)
        let expected: [Note] = [.g, .b, .d, .f]
        #expect(chord == expected)
    }
    
    @Test("B Diminished chord")
    func bDiminishedChord() {
        let chord = ChordBuilder.buildChord(root: .b, chordType: .diminished)
        let expected: [Note] = [.b, .d, .f]
        #expect(chord == expected)
    }
    
    @Test("Major scale diatonic chord types")
    func majorDiatonicChordTypes() {
        let types = DiatonicChordMaps.major
        let expected: [ChordType] = [.major, .minor, .minor, .major, .major, .minor, .diminished]
        #expect(types == expected)
    }
}

@Suite("Roman Numerals Tests")
struct RomanNumeralsTests {
    
    @Test("Major scale Roman numerals")
    func majorRomanNumerals() {
        let numerals = RomanNumerals.getRomanNumerals(for: .major)
        #expect(numerals[0] == "I")
        #expect(numerals[1] == "ii")
        #expect(numerals[2] == "iii")
        #expect(numerals[3] == "IV")
        #expect(numerals[4] == "V")
        #expect(numerals[5] == "vi")
        #expect(numerals[6] == "vii°")
    }
    
    @Test("Minor Natural Roman numerals")
    func minorNaturalRomanNumerals() {
        let numerals = RomanNumerals.getRomanNumerals(for: .minorNatural)
        #expect(numerals[0] == "i")
        #expect(numerals[1] == "ii°")
        #expect(numerals[2] == "III")
        #expect(numerals[3] == "iv")
        #expect(numerals[4] == "v")
        #expect(numerals[5] == "VI")
        #expect(numerals[6] == "VII")
    }
}
