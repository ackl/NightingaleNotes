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
    
    /// Set up the audio engine with player nodes
    private func setupAudioEngine() {
        let mainMixer = audioEngine.mainMixerNode
        
        // Create player nodes for polyphony
        for _ in 0..<maxVoices {
            let player = AVAudioPlayerNode()
            audioEngine.attach(player)
            audioEngine.connect(player, to: mainMixer, format: nil)
            playerNodes.append(player)
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
        
        // Get next player (round-robin)
        let player = playerNodes[currentPlayerIndex]
        currentPlayerIndex = (currentPlayerIndex + 1) % maxVoices
        
        // Stop any currently playing sound on this player
        if player.isPlaying {
            player.stop()
        }
        
        // Disconnect player from any previous nodes (mixer or pitch effect)
        audioEngine.disconnectNodeOutput(player)
        
        // Create pitch shift effect if needed
        if abs(pitchShift) > 0.1 {
            // Apply time pitch effect
            let timePitch = AVAudioUnitTimePitch()
            timePitch.pitch = pitchShift
            
            // Connect through time pitch
            audioEngine.attach(timePitch)
            audioEngine.connect(player, to: timePitch, format: buffer.format)
            audioEngine.connect(timePitch, to: audioEngine.mainMixerNode, format: buffer.format)
        } else {
            // Connect directly to mixer if no pitch shift needed
            audioEngine.connect(player, to: audioEngine.mainMixerNode, format: buffer.format)
        }
        
        // Set volume based on velocity
        player.volume = velocity
        
        // Schedule and play
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
