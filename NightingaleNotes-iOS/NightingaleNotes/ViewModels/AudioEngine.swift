import Foundation
import AVFoundation

/// Audio engine for playing piano notes using AVFoundation
/// Uses pre-recorded piano samples with pitch shifting for intermediate notes
@MainActor
@Observable
public class AudioEngine {
    
    /// Shared instance for app-wide audio playback
    public static let shared = AudioEngine()
    
    /// The AVAudioEngine instance
    private var audioEngine: AVAudioEngine
    
    /// Player nodes for polyphonic playback
    private var playerNodes: [AVAudioPlayerNode] = []
    
    /// Pitch shift units paired with each player node
    private var pitchUnits: [AVAudioUnitTimePitch] = []
    
    /// Maximum number of simultaneous voices
    private let maxVoices = 16
    
    /// Currently playing player index (round-robin)
    private var currentPlayerIndex = 0
    
    /// Cached audio buffers for each sample
    private var sampleBuffers: [String: AVAudioPCMBuffer] = [:]
    
    /// Sample notes available (every minor third: C, D#, F#, A)
    private let sampleNotes: [Note] = [.c, .dSharp, .fSharp, .a]
    
    /// Available octaves for samples
    private let sampleOctaves = 2...7
    
    /// Whether audio is ready
    public private(set) var isReady = false
    
    private init() {
        audioEngine = AVAudioEngine()
        setupAudioSession()
        setupAudioEngine()
        loadSamples()
    }
    
    /// Set up the audio session for playback
    private func setupAudioSession() {
        #if os(iOS)
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
        #endif
    }
    
    /// Set up the audio engine with player nodes and persistent pitch shift units
    private func setupAudioEngine() {
        let mainMixer = audioEngine.mainMixerNode
        
        // Create player nodes with dedicated pitch units for polyphony
        // Each player has its own pitch shift unit - no reconnection needed
        for _ in 0..<maxVoices {
            let player = AVAudioPlayerNode()
            let pitchUnit = AVAudioUnitTimePitch()
            
            audioEngine.attach(player)
            audioEngine.attach(pitchUnit)
            
            // Connect: player -> pitchUnit -> mixer
            // We'll set pitch to 0 when no shift is needed
            audioEngine.connect(player, to: pitchUnit, format: nil)
            audioEngine.connect(pitchUnit, to: mainMixer, format: nil)
            
            playerNodes.append(player)
            pitchUnits.append(pitchUnit)
        }
        
        do {
            try audioEngine.start()
            isReady = true
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }
    
    /// Load all piano samples into memory
    private func loadSamples() {
        for octave in sampleOctaves {
            for note in sampleNotes {
                let sampleName = sampleFileName(for: note, octave: octave)
                if let url = Bundle.main.url(forResource: sampleName, withExtension: "mp3"),
                   let buffer = loadAudioBuffer(from: url) {
                    sampleBuffers[sampleName] = buffer
                }
            }
        }
    }
    
    /// Generate the sample file name for a note and octave
    private func sampleFileName(for note: Note, octave: Int) -> String {
        let noteString: String
        switch note {
        case .c: noteString = "C"
        case .dSharp: noteString = "Ds"
        case .fSharp: noteString = "Fs"
        case .a: noteString = "A"
        default: noteString = "C" // Fallback
        }
        return "\(noteString)\(octave)v8"
    }
    
    /// Load an audio file into a PCM buffer
    private func loadAudioBuffer(from url: URL) -> AVAudioPCMBuffer? {
        do {
            let audioFile = try AVAudioFile(forReading: url)
            let format = audioFile.processingFormat
            let frameCount = UInt32(audioFile.length)
            
            guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
                return nil
            }
            
            try audioFile.read(into: buffer)
            return buffer
        } catch {
            print("Failed to load audio file: \(error)")
            return nil
        }
    }
    
    /// Find the closest sample for a given note and octave
    private func findClosestSample(for note: Note, octave: Int) -> (sampleName: String, pitchShift: Float)? {
        // Clamp octave to available range
        let clampedOctave = max(sampleOctaves.lowerBound, min(sampleOctaves.upperBound, octave))
        
        let noteValue = note.rawValue
        
        // Use floor logic to find sample at or below the note
        // Matches web version: 0-2 -> C, 3-5 -> D#, 6-8 -> F#, 9-11 -> A
        let closestSampleNote: Note
        if noteValue < 3 {
            closestSampleNote = .c
        } else if noteValue < 6 {
            closestSampleNote = .dSharp
        } else if noteValue < 9 {
            closestSampleNote = .fSharp
        } else {
            closestSampleNote = .a
        }
        
        // Calculate semitone difference (always 0, 1, or 2)
        let semitoneShift = noteValue - closestSampleNote.rawValue
        
        let sampleName = sampleFileName(for: closestSampleNote, octave: clampedOctave)
        
        // Pitch shift in cents (100 cents per semitone)
        let pitchShift = Float(semitoneShift * 100)
        
        return (sampleName, pitchShift)
    }
    
    /// Play a note at a specific octave
    /// - Parameters:
    ///   - note: The note to play
    ///   - octave: The octave (default 4)
    ///   - velocity: The velocity (0.0 to 1.0, default 0.8)
    public func playNote(_ note: Note, octave: Int = 4, velocity: Float = 0.8) {
        guard isReady else { return }
        
        guard let (sampleName, pitchShift) = findClosestSample(for: note, octave: octave),
              let buffer = sampleBuffers[sampleName] else {
            return
        }
        
        // Get next player and its paired pitch unit (round-robin)
        let playerIndex = currentPlayerIndex
        let player = playerNodes[playerIndex]
        let pitchUnit = pitchUnits[playerIndex]
        currentPlayerIndex = (currentPlayerIndex + 1) % maxVoices
        
        // Stop any currently playing sound on this player
        if player.isPlaying {
            player.stop()
        }
        
        // Set pitch shift (0 if no shift needed)
        pitchUnit.pitch = pitchShift
        
        // Set volume based on velocity
        player.volume = velocity
        
        // Schedule and play immediately
        player.scheduleBuffer(buffer, at: nil, options: [], completionHandler: nil)
        player.play()
    }
    
    /// Play multiple notes simultaneously (chord)
    /// - Parameters:
    ///   - notes: Array of notes to play
    ///   - octave: Base octave
    ///   - velocity: Velocity (0.0 to 1.0)
    public func playChord(_ notes: [Note], octave: Int = 4, velocity: Float = 0.8) {
        for note in notes {
            playNote(note, octave: octave, velocity: velocity)
        }
    }
    
    /// Play notes sequentially (for scales/arpeggios) with precise timing
    /// - Parameters:
    ///   - notesWithOctaves: Array of tuples containing (note, octave) to play in sequence
    ///   - interval: Time interval between notes in seconds (default 0.25)
    ///   - velocity: Velocity (0.0 to 1.0)
    ///   - onNotePlayed: Optional callback when each note is played, with the index
    public func playSequence(
        _ notesWithOctaves: [(note: Note, octave: Int)],
        interval: TimeInterval = 0.25,
        velocity: Float = 0.8,
        onNotePlayed: ((Int) -> Void)? = nil
    ) {
        guard isReady, !notesWithOctaves.isEmpty else { return }
        
        var currentIndex = 0
        let notes = notesWithOctaves
        
        // Create a precise timer on a high-priority queue
        let timerQueue = DispatchQueue(label: "com.nightingale.sequencer", qos: .userInteractive)
        let timer = DispatchSource.makeTimerSource(flags: .strict, queue: timerQueue)
        
        // Fire immediately for first note, then at regular intervals
        timer.schedule(deadline: .now(), repeating: interval, leeway: .milliseconds(1))
        
        timer.setEventHandler { [weak self] in
            guard let self = self, currentIndex < notes.count else {
                timer.cancel()
                return
            }
            
            let noteInfo = notes[currentIndex]
            let index = currentIndex
            currentIndex += 1
            
            // Play note on main thread (required for @MainActor)
            DispatchQueue.main.async {
                self.playNote(noteInfo.note, octave: noteInfo.octave, velocity: velocity)
                onNotePlayed?(index)
            }
            
            // Cancel timer after last note
            if currentIndex >= notes.count {
                timer.cancel()
            }
        }
        
        timer.resume()
    }
    
    /// Stop all currently playing sounds
    public func stopAll() {
        for player in playerNodes {
            if player.isPlaying {
                player.stop()
            }
        }
    }
    
    /// Prepare the engine for playback (call on app launch)
    public func prepare() {
        // Ensure audio session is active
        #if os(iOS)
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to activate audio session: \(error)")
        }
        #endif
        
        // Restart engine if needed
        if !audioEngine.isRunning {
            do {
                try audioEngine.start()
                isReady = true
            } catch {
                print("Failed to restart audio engine: \(error)")
            }
        }
    }
}
