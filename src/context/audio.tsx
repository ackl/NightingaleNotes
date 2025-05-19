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
  fetched: boolean;

  constructor() {
    this.filenames = sampleFilenames;
    this.arrayBuffers = {};
    this.audioBuffers = null;
    this.fetched = false;
  }

  async fetch() {
    if (this.fetched) return;

    const responses = await Promise.all(
      sampleFilenames.map(async (x) =>
        fetch(`/${x}v8.mp3`).then((res) => res.arrayBuffer())
      ),
    );

    responses.forEach((res, i) => {
      this.arrayBuffers[sampleFilenames[i]] = res;
    });

    this.fetched = true;
  }

  loadIntoContext(ctx: AudioContext) {
    this.audioBuffers = {} as AudioBuffers;

    Object.entries(this.arrayBuffers).map(([note, arrayBuf]) => {
      ctx.decodeAudioData(arrayBuf).then((sample) => {
        this.audioBuffers![note as SampleName] = sample;
      });
    });
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

  function playTone(noteValue: number, when = 0) {
    if (audioContext && bufferLoader?.audioBuffers) {
      const source = audioContext.createBufferSource();
      setActiveSources((prev) => [...prev, source]);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1;

      const sampleInfo = getSampleForNote(noteValue);
      source.buffer = bufferLoader.audioBuffers[sampleInfo.sample];

      source.detune.value = sampleInfo.detune * 100;
      // we're saying that octave 0 is octave below middle C
      // noteValue is based on C = 0, need to subtract 18 semitones as sample is A440
      //source.detune.value = (noteValue - 18) * 100;
      const $el = document.querySelector(`.ivory--${noteValue}`);
      setTimeout(() => {
        $el?.classList.add("flash");
        setTimeout(function () {
          $el?.classList.remove("flash");
        }, 600);
      }, when * 1000);

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(audioContext.currentTime + when);
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
    function createAudioContext() {
      if (typeof AudioContext !== "undefined") {
        setAudioContext(new AudioContext());
      } else if (typeof window.webkitAudioContext !== "undefined") {
        setAudioContext(new window.webkitAudioContext());
      } else {
        console.error("Web Audio API is not supported in this browser");
      }

      setInit(true);
    }

    if (!init) {
      document.addEventListener("click", createAudioContext);
      document.addEventListener("touchend", createAudioContext);
    }

    return () => {
      document.removeEventListener("click", createAudioContext);
      document.removeEventListener("touchend", createAudioContext);
    };
  }, [init]);

  useEffect(() => {
    if (bufferLoader) {
      if (!bufferLoader.fetched) {
        bufferLoader.fetch();
      }
    }
  }, [bufferLoader]);

  useEffect(() => {
    if (!bufferLoader) {
      setBufferLoader(new BufferLoader());
    }
  }, []);

  useEffect(() => {
    if (audioContext && bufferLoader?.arrayBuffers) {
      bufferLoader.loadIntoContext(audioContext);
    }
  }, [audioContext, bufferLoader?.arrayBuffers]);

  return (
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
  );
};
