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
}

const initialAudioContextState: AudioContextState = {
  audioContext: null,
  playSequence: () => { },
  playChord: () => { },
  playTone: () => { },
  playNotes: () => { },
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
    
    console.log("[Audio Debug] fetchSamples called with:", samples);
    console.log("[Audio Debug] samples to fetch:", toFetch);
    
    if (toFetch.length === 0) return;

    // Mark as currently fetching
    toFetch.forEach(sample => this.currentlyFetching.add(sample));

    try {
      const responses = await Promise.all(
        toFetch.map(async (sample) => {
          console.log("[Audio Debug] Fetching sample:", `/${sample}v8.mp3`);
          const response = await fetch(`/${sample}v8.mp3`);
          console.log("[Audio Debug] Fetch response for", sample, ":", response.status, response.ok);
          return response.arrayBuffer();
        }),
      );

      responses.forEach((res, i) => {
        const sample = toFetch[i];
        console.log("[Audio Debug] Received arrayBuffer for", sample, "size:", res.byteLength);
        this.arrayBuffers[sample] = res;
        this.fetched.add(sample);
        this.currentlyFetching.delete(sample);
      });
    } catch (error) {
      console.error("[Audio Debug] Error fetching samples:", error);
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
    console.log("[Audio Debug] loadIntoContext called");
    if (!this.audioBuffers) {
      this.audioBuffers = {} as AudioBuffers;
    }

    Object.entries(this.arrayBuffers).forEach(([note, arrayBuf]) => {
      if (!this.audioBuffers![note as SampleName]) {
        console.log("[Audio Debug] Decoding audio data for:", note);
        ctx.decodeAudioData(arrayBuf).then((sample) => {
          console.log("[Audio Debug] Successfully decoded audio data for:", note);
          this.audioBuffers![note as SampleName] = sample;
        }).catch((error) => {
          console.error(`[Audio Debug] Failed to decode audio data for ${note}:`, error);
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
  const { octaves } = useContext(SettingsContext);

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
    console.log("[Audio Debug] playTone called with noteValue:", noteValue, "when:", when);
    console.log("[Audio Debug] audioContext:", audioContext);
    console.log("[Audio Debug] audioContext state:", audioContext?.state);
    console.log("[Audio Debug] bufferLoader:", bufferLoader);

    if (!audioContext) {
      console.error("[Audio Debug] No audioContext available");
      return;
    }

    // Ensure AudioContext is resumed for iOS Safari
    if (audioContext?.state === 'suspended') {
      console.log("[Audio Debug] AudioContext suspended in playTone, attempting to resume...");
      try {
        await audioContext.resume();
        console.log("[Audio Debug] AudioContext resumed in playTone, new state:", audioContext.state);
      } catch (error) {
        console.error("[Audio Debug] Failed to resume AudioContext in playTone:", error);
        return;
      }
    }

    const sampleInfo = getSampleForNote(noteValue);
    console.log("[Audio Debug] Sample info:", sampleInfo);
    
    // Check if sample is ready, if not, try to load it
    if (!bufferLoader?.isSampleReady(sampleInfo.sample)) {
      console.log("[Audio Debug] Sample not ready, fetching:", sampleInfo.sample);
      bufferLoader?.fetchSamples([sampleInfo.sample]).then(() => {
        console.log("[Audio Debug] Sample fetched, loading into context");
        if (audioContext && bufferLoader?.audioBuffers) {
          bufferLoader.loadIntoContext(audioContext);
          // Retry playing after a short delay
          setTimeout(() => playTone(noteValue, when), 50);
        }
      });
      return;
    }

    console.log("[Audio Debug] Sample ready, attempting to play");
    if (audioContext && bufferLoader?.audioBuffers) {
      const source = audioContext.createBufferSource();
      setActiveSources((prev) => [...prev, source]);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1;

      const audioBuffer = bufferLoader.audioBuffers[sampleInfo.sample];
      console.log("[Audio Debug] Audio buffer:", audioBuffer);
      
      if (!audioBuffer) {
        console.error("[Audio Debug] No audio buffer found for sample:", sampleInfo.sample);
        return;
      }

      source.buffer = audioBuffer;
      source.detune.value = sampleInfo.detune * 100;
      console.log("[Audio Debug] Source configured with detune:", sampleInfo.detune * 100);
      
      // Clean up source after it finishes
      source.onended = () => {
        console.log("[Audio Debug] Audio source ended");
        setActiveSources((prev) => prev.filter(s => s !== source));
      };

      // Sanitize noteValue for DOM query
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
      console.log("[Audio Debug] About to start audio source at time:", audioContext.currentTime + when);
      
      try {
        source.start(audioContext.currentTime + when);
        console.log("[Audio Debug] Audio source started successfully");
      } catch (error) {
        console.error("[Audio Debug] Failed to start audio source:", error);
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
    async function createAudioContext() {
      console.log("[Audio Debug] Creating AudioContext...");
      try {
        let ctx: AudioContext;
        if (typeof AudioContext !== "undefined") {
          console.log("[Audio Debug] Using AudioContext");
          ctx = new AudioContext();
        } else if (typeof window.webkitAudioContext !== "undefined") {
          console.log("[Audio Debug] Using webkitAudioContext");
          ctx = new window.webkitAudioContext();
        } else {
          console.error("[Audio Debug] Web Audio API is not supported in this browser");
          return;
        }

        console.log("[Audio Debug] AudioContext created, state:", ctx.state);

        // Store reference globally for iOS Safari workaround
        (window as any).audioContext = ctx;

        // iOS Safari requires AudioContext to be resumed after user gesture
        if (ctx.state === 'suspended') {
          console.log("[Audio Debug] AudioContext suspended, attempting to resume...");
          await ctx.resume();
          console.log("[Audio Debug] AudioContext resumed, new state:", ctx.state);
        }

        setAudioContext(ctx);
        setInit(true);
        console.log("[Audio Debug] AudioContext initialized successfully");
      } catch (error) {
        console.error("[Audio Debug] Failed to create/resume AudioContext:", error);
      }
    }

    // iOS Safari specific workaround
    function resumeAudioContext() {
      console.log("[Audio Debug] iOS Safari resume handler triggered");
      if ((window as any).audioContext && (window as any).audioContext.state === 'suspended') {
        console.log("[Audio Debug] Resuming suspended AudioContext...");
        (window as any).audioContext.resume().then(() => {
          console.log("[Audio Debug] AudioContext resumed via touchend handler");
        }).catch((error: any) => {
          console.error("[Audio Debug] Failed to resume AudioContext:", error);
        });
      }
    }

    if (!init) {
      console.log("[Audio Debug] Adding event listeners for audio initialization");
      document.addEventListener("click", createAudioContext);
      document.addEventListener("touchend", createAudioContext);
      document.addEventListener("touchstart", createAudioContext);
      
      // iOS Safari specific workaround
      document.addEventListener('touchend', resumeAudioContext);
    }

    return () => {
      document.removeEventListener("click", createAudioContext);
      document.removeEventListener("touchend", createAudioContext);
      document.removeEventListener("touchstart", createAudioContext);
      document.removeEventListener('touchend', resumeAudioContext);
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
        }}
      >
        {children}
      </AudioReactContext.Provider>
    </ErrorBoundary>
  );
};
