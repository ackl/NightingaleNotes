import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SettingsContext } from "./settings";
import { Note, Sequence } from "../lib";
import { ErrorBoundary } from "../components/ErrorBoundary";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface AudioContextState {
  audioContext: AudioContext | null;
  playSequence: (n: number[]) => void;
  playChord: (n: number[]) => void;
  playTone: (n: number) => void;
  playNotes: (s: Sequence) => void;
  audioReady: boolean;
  audioStatus: string;
}

const initialAudioContextState: AudioContextState = {
  audioContext: null,
  playSequence: () => { },
  playChord: () => { },
  playTone: () => { },
  playNotes: () => { },
  audioReady: false,
  audioStatus: 'initializing',
};

export const AudioReactContext = createContext<AudioContextState>(
  initialAudioContextState,
);

// have samples per minor third
// can't just use one sample and pitch shift it cos we need the overtones to match (approx).
// 0  3   6   9
// C  D#  F#  A

function getSampleForNote(note: number) {
  // first get closest lower sample note label
  const modNote = note % 12;
  let fileNamePrefix = "A";
  if (modNote < 3) {
    fileNamePrefix = "C";
  } else if (modNote < 6) {
    fileNamePrefix = "Ds";
  } else if (modNote < 9) {
    fileNamePrefix = "Fs";
  }

  // append the octave number
  // our lowest C is C2 which is octave 0
  const octaveNumber = Math.floor(note / 12);
  return {
    sample: `${fileNamePrefix}${octaveNumber + 3}` as SampleName,
    detune: modNote % 3,
  };
}

const sampleFilenames = [ "C2", "Ds2", "Fs2",
  "A2", "C3", "Ds3", "Fs3", "A3", "C4", "Ds4",
  "Fs4", "A4", "C5", "Ds5", "Fs5", "A5", "C6",
  "Ds6", "Fs6", "A6", ] as const;

type SampleName = typeof sampleFilenames[number];
type ArrayBuffers = Partial<Record<SampleName, ArrayBuffer>>;
type AudioBuffers = Record<SampleName, AudioBuffer>;

class BufferLoader {
  filenames: readonly string[];
  arrayBuffers: ArrayBuffers;
  audioBuffers: AudioBuffers | null;
  fetched: Set<SampleName>;
  currentlyFetching: Set<SampleName>;

  constructor() {
    this.filenames = sampleFilenames;
    this.arrayBuffers = {};
    this.audioBuffers = null;
    this.fetched = new Set();
    this.currentlyFetching = new Set();
  }

  // Load essential samples for immediate playback (current octave range)
  async fetchEssentials() {
    const essentialSamples = ["C3", "Ds3", "Fs3", "A3", "C4", "Ds4", "Fs4", "A4"] as SampleName[];
    return this.fetchSamples(essentialSamples);
  }

  // Load specific samples on demand
  async fetchSamples(samples: SampleName[]) {
    const toFetch = samples.filter(sample => 
      !this.fetched.has(sample) && !this.currentlyFetching.has(sample)
    );
    
    
    if (toFetch.length === 0) return;

    // Mark as currently fetching
    toFetch.forEach(sample => this.currentlyFetching.add(sample));

    try {
      const responses = await Promise.all(
        toFetch.map(async (sample) => {
          const response = await fetch(`/${sample}v8.mp3`);
          return response.arrayBuffer();
        }),
      );

      responses.forEach((res, i) => {
        const sample = toFetch[i];
        this.arrayBuffers[sample] = res;
        this.fetched.add(sample);
        this.currentlyFetching.delete(sample);
      });
    } catch (error) {
      // Remove from fetching set on error
      toFetch.forEach(sample => this.currentlyFetching.delete(sample));
      throw error;
    }
  }

  // Get samples needed for a specific octave range
  getSamplesForOctaveRange(minOctave: number, maxOctave: number): SampleName[] {
    return sampleFilenames.filter(sample => {
      const octave = parseInt(sample.slice(-1));
      return octave >= minOctave && octave <= maxOctave;
    });
  }

  // Legacy method for backward compatibility
  async fetch() {
    return this.fetchSamples([...sampleFilenames]);
  }

  loadIntoContext(ctx: AudioContext) {
    if (!this.audioBuffers) {
      this.audioBuffers = {} as AudioBuffers;
    }

    Object.entries(this.arrayBuffers).forEach(([note, arrayBuf]) => {
      if (!this.audioBuffers![note as SampleName]) {
        ctx.decodeAudioData(arrayBuf).then((sample) => {
          this.audioBuffers![note as SampleName] = sample;
        }).catch((error) => {
          console.error(`Failed to decode audio data for ${note}:`, error);
        });
      }
    });
  }

  // Check if a sample is ready for playback
  isSampleReady(sample: SampleName): boolean {
    return this.audioBuffers?.[sample] !== undefined;
  }
}

export const AudioReactProvider = ({ children }: { children: ReactNode }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [init, setInit] = useState(false);
  const [bufferLoader, setBufferLoader] = useState<BufferLoader>();
  const [activeSources, setActiveSources] = useState<AudioBufferSourceNode[]>(
    [],
  );
  const [audioReady, setAudioReady] = useState(false);
  const [audioStatus, setAudioStatus] = useState('initializing');
  const { octaves } = useContext(SettingsContext);

  // Minimal iOS Safari unlock function
  function unlockAudioContext(audioCtx: AudioContext) {
    if (audioCtx.state !== 'suspended') {
      setAudioReady(true);
      setAudioStatus('ready');
      return;
    }
    
    const unlock = () => {
      audioCtx.resume().then(() => {
        // Play silent buffer to truly unlock iOS Safari
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        
        setAudioReady(true);
        setAudioStatus('ready');
        
        // Clean up
        ['touchstart', 'click'].forEach(e => 
          document.body.removeEventListener(e, unlock)
        );
      });
    };
    
    ['touchstart', 'click'].forEach(e => 
      document.body.addEventListener(e, unlock, { once: false })
    );
  }

  function stopAllSources() {
    activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        console.log(e);
      }
    });
    setActiveSources([]);
  }

  function playSequence(notes: number[]) {
    stopAllSources();
    notes.forEach((n, i) => {
      playTone(n, i / 4);
    });
  }

  function playChord(notes: number[]) {
    stopAllSources();
    notes.forEach((n) => playTone(n, 0));
  }

  async function playTone(noteValue: number, when = 0) {
    if (!audioContext) return;

    // Ensure AudioContext is running (iOS Safari requirement)
    if (audioContext.state !== 'running') {
      try {
        await audioContext.resume();
        if (audioContext.state === 'running') {
          setAudioReady(true);
          setAudioStatus('ready');
        }
      } catch (error) {
        return;
      }
    }

    if (audioContext.state !== 'running') return;

    const sampleInfo = getSampleForNote(noteValue);
    
    // Check if sample is ready, if not, try to load it
    if (!bufferLoader?.isSampleReady(sampleInfo.sample)) {
      bufferLoader?.fetchSamples([sampleInfo.sample]).then(() => {
        if (audioContext && bufferLoader?.audioBuffers) {
          bufferLoader.loadIntoContext(audioContext);
          setTimeout(() => playTone(noteValue, when), 50);
        }
      });
      return;
    }

    if (audioContext && bufferLoader?.audioBuffers) {
      const source = audioContext.createBufferSource();
      setActiveSources((prev) => [...prev, source]);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1;

      const audioBuffer = bufferLoader.audioBuffers[sampleInfo.sample];
      if (!audioBuffer) return;

      source.buffer = audioBuffer;
      source.detune.value = sampleInfo.detune * 100;
      
      source.onended = () => {
        setActiveSources((prev) => prev.filter(s => s !== source));
      };

      // Visual feedback
      const safeNoteValue = Math.max(0, Math.min(127, noteValue));
      const $el = document.querySelector(`.ivory--${safeNoteValue}`);
      setTimeout(() => {
        $el?.classList.add("flash");
        setTimeout(function () {
          $el?.classList.remove("flash");
        }, 600);
      }, when * 1000);

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      try {
        source.start(audioContext.currentTime + when);
      } catch (error) {
        // Ignore start errors
      }
    }
  }

  function generateSequenceNotes(sequence: Sequence) {
    const max = Math.max(...sequence.notes);
    const maxIdx = sequence.notes.indexOf(max as Note);

    // rearrange so that whole array of notes is only
    // ascending numbers without the modulo 12
    // this is so that the audioContext sample can use this value
    // to determine how to detune the A440 sample
    const lower = sequence.notes.slice(0, maxIdx + 1);

    //const upper = sequence.notes.slice(maxIdx + 1).map((x) => x + 12);
    const upper = sequence.notes.slice(maxIdx + 1).map((x) => x + 12);

    // since we build notes of a heptatonic add back the octave
    const sequenceNotes = [...lower, ...upper, lower[0] + 12];
    return sequenceNotes;
  }

  const buildWholeSequence = useCallback((sequence: Sequence) => {
    let sequenceNotes = generateSequenceNotes(sequence);
    for (let i = 2; i < octaves; i++) {
      const nextOctave: number[] = [];
      for (let j = 0; j < 8; j++) {
        nextOctave.push(sequenceNotes[j] + (12 * (i - 1)));
      }
      sequenceNotes = Array.from(new Set([...sequenceNotes, ...nextOctave]));
    }

    return sequenceNotes;
  }, [octaves]);

  function playNotes(sequence: Sequence) {
    if (!audioContext) {
      setTimeout(() => {
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        setTimeout(() => {
          document.querySelector(".play")?.dispatchEvent(clickEvent);
        }, 100);
      }, 1);
    } else {
      if (sequence) {
        const sequenceNotes = buildWholeSequence(sequence);
        sequenceNotes.length > 7
          ? playSequence(sequenceNotes)
          : playChord(sequenceNotes);
      }
    }
  }

  useEffect(() => {
    let hasUserInteracted = false;

    async function createAudioContext() {
      if (hasUserInteracted) return;
      
      try {
        // Modern AudioContext creation
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          setAudioStatus('unsupported');
          return;
        }
        
        const ctx = new AudioContextClass();
        
        // Set up iOS Safari unlock
        unlockAudioContext(ctx);
        
        hasUserInteracted = true;
        setAudioContext(ctx);
        setInit(true);
        setAudioReady(ctx.state === 'running');
        setAudioStatus(ctx.state === 'running' ? 'ready' : 'waiting for unlock');
        
        // Remove event listeners after successful initialization
        document.removeEventListener("click", createAudioContext);
        document.removeEventListener("touchend", createAudioContext);
        document.removeEventListener("touchstart", createAudioContext);
      } catch (error) {
        setAudioStatus('error');
        hasUserInteracted = false; // Allow retry
      }
    }

    if (!init) {
      setAudioStatus('waiting for user interaction');
      document.addEventListener("click", createAudioContext, { once: false, capture: true });
      document.addEventListener("touchend", createAudioContext, { once: false, capture: true });
      document.addEventListener("touchstart", createAudioContext, { once: false, capture: true });
    }

    return () => {
      if (!hasUserInteracted) {
        document.removeEventListener("click", createAudioContext, true);
        document.removeEventListener("touchend", createAudioContext, true);
        document.removeEventListener("touchstart", createAudioContext, true);
      }
    };
  }, [init]);

  // Load essential samples first, then load based on octave needs
  useEffect(() => {
    if (bufferLoader) {
      // Load essential samples immediately
      bufferLoader.fetchEssentials();
    }
  }, [bufferLoader]);

  // Load additional samples when octave range changes
  useEffect(() => {
    if (bufferLoader && octaves > 2) {
      const currentOctave = Math.floor(octaves / 2) + 2; // Estimate middle octave
      const neededSamples = bufferLoader.getSamplesForOctaveRange(
        Math.max(2, currentOctave - 1),
        Math.min(6, currentOctave + Math.ceil(octaves / 2))
      );
      
      bufferLoader.fetchSamples(neededSamples);
    }
  }, [bufferLoader, octaves]);

  useEffect(() => {
    if (!bufferLoader) {
      setBufferLoader(new BufferLoader());
    }
  }, [bufferLoader]);

  useEffect(() => {
    if (audioContext && bufferLoader?.arrayBuffers) {
      bufferLoader.loadIntoContext(audioContext);
    }
  }, [audioContext, bufferLoader]);

  return (
    <ErrorBoundary>
      <AudioReactContext.Provider
        value={{
          audioContext,
          playSequence,
          playChord,
          playTone,
          playNotes,
          audioReady,
          audioStatus,
        }}
      >
        {children}
      </AudioReactContext.Provider>
    </ErrorBoundary>
  );
};
