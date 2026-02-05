import Testing
@testable import NightingaleNotes

@Suite("Key Labeling Tests")
struct KeyLabelingTests {
    
    @Test("Harmonic Minor Natural Signs")
    @MainActor
    func harmonicMinorNaturalSigns() {
        let settings = SettingsViewModel()
        
        // C Harmonic Minor: C, D, Eb, F, G, Ab, B♮
        settings.tonic = .c
        settings.tonality = .minorHarmonic
        
        // Check B (7th degree)
        let bLabel = settings.noteLabel(for: .b)
        #expect(bLabel.description == "B♮")
        
        // Check Eb (3rd degree) - should be regular flat
        let ebLabel = settings.noteLabel(for: .dSharp) // .dSharp is 3
        #expect(ebLabel.description == "E♭")
        
        // F Harmonic Minor: F, G, Ab, Bb, C, Db, E♮
        settings.tonic = .f
        settings.tonality = .minorHarmonic
        
        // Check E (7th degree)
        let eLabel = settings.noteLabel(for: .e)
        #expect(eLabel.description == "E♮")
        
        // Bb Harmonic Minor: Bb, C, Db, Eb, F, Gb, A♮
        settings.tonic = .aSharp // .aSharp is 10 (Bb)
        settings.tonality = .minorHarmonic
        
        // Check A (7th degree)
        let aLabel = settings.noteLabel(for: .a)
        #expect(aLabel.description == "A♮")
    }
    
    @Test("Melodic Minor Natural Signs")
    @MainActor
    func melodicMinorNaturalSigns() {
        let settings = SettingsViewModel()
        
        // C Melodic Minor: C, D, Eb, F, G, A♮, B♮
        settings.tonic = .c
        settings.tonality = .minorMelodic
        
        // Check A (6th degree)
        let aLabel = settings.noteLabel(for: .a)
        #expect(aLabel.description == "A♮")
        
        // Check B (7th degree)
        let bLabel = settings.noteLabel(for: .b)
        #expect(bLabel.description == "B♮")
        
        // F Melodic Minor: F, G, Ab, Bb, C, D♮, E♮
        settings.tonic = .f
        settings.tonality = .minorMelodic
        
        // Check D (6th degree)
        let dLabel = settings.noteLabel(for: .d)
        #expect(dLabel.description == "D♮")
        
        // Check E (7th degree)
        let eLabel = settings.noteLabel(for: .e)
        #expect(eLabel.description == "E♮")
    }
    
    @Test("Chromatic Fallback")
    @MainActor
    func chromaticFallback() {
        let settings = SettingsViewModel()
        
        // C Major: C, D, E, F, G, A, B
        settings.tonic = .c
        settings.tonality = .major
        
        // Check C# (not in scale) - should use chromatic label (C#)
        let csLabel = settings.noteLabel(for: .cSharp)
        #expect(csLabel.description == "C♯")
        
        // F Major: F, G, A, Bb, C, D, E
        // Uses flats
        settings.tonic = .f
        settings.tonality = .major
        
        // Check Ab (not in scale) - should use chromatic label (Ab)
        // note: note 8 is G#/Ab
        let abLabel = settings.noteLabel(for: .gSharp)
        #expect(abLabel.description == "A♭")
    }
}
