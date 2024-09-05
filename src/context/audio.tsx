import type { ReactNode } from 'react'
import { useState, useEffect, createContext } from 'react'

interface AudioContextState {
  audioContext: AudioContext | null;
  playSequence: (n: number[]) => void;
  playChord: (n: number[]) => void;
  playTone: (n: number) => void;
}

const initialAudioContextState: AudioContextState = {
  audioContext: null,
  playSequence: () => {},
  playChord: () => {},
  playTone: () => {}
}

export const AudioReactContext = createContext<AudioContextState>(initialAudioContextState);

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

// have samples per minor third
// 0  3   6   9
// C  D#  F#  A

function getSampleForNote(note: number) {
  // first get closest lower sample note label
  const modNote = note % 12;
  let fileNamePrefix = 'A';
  if (modNote < 3) {
    fileNamePrefix = 'C';
  } else if (modNote < 6) {
    fileNamePrefix = 'Ds';
  } else if (modNote < 9) {
    fileNamePrefix = 'Fs';
  }

  // append the octave number
  // our lowest C is C2 which is octave 0
  const octaveNumber = Math.floor(note / 12);
  return {
    sample: `${fileNamePrefix}${octaveNumber + 3}` as SampleName,
    detune: modNote % 3
  }
}

const sampleFilenames = [
  'C2', 'Ds2', 'Fs2', 'A2',
  'C3', 'Ds3', 'Fs3', 'A3',
  'C4', 'Ds4', 'Fs4', 'A4',
  'C5', 'Ds5', 'Fs5', 'A5',
  'C6', 'Ds6', 'Fs6', 'A6',
] as const;

type SampleName = typeof sampleFilenames[number];


type ArrayBuffers = Partial<Record<SampleName, ArrayBuffer>>
type AudioBuffers = Record<SampleName, AudioBuffer>

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
      sampleFilenames.map(async x => fetch(`/${x}v8.mp3`).then(res => res.arrayBuffer()))
    )

    responses.forEach((res, i) => {
      this.arrayBuffers[sampleFilenames[i]] = res;
    });

    this.fetched = true;
  }

  loadIntoContext(ctx: AudioContext) {
    this.audioBuffers = {} as AudioBuffers;

    Object.entries(this.arrayBuffers).map(([note, arrayBuf]) => {
      ctx.decodeAudioData(arrayBuf)
        .then((sample) => {
          this.audioBuffers![note as SampleName] = sample;
        });
    });
  }
}

export const AudioReactProvider = ({ children }: { children: ReactNode }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [init, setInit] = useState(false);
  const [bufferLoader, setBufferLoader] = useState<BufferLoader>();

  function playSequence(notes: number[]) {
    notes.forEach((n, i) => {
      playTone(n, i / 4)
    });
  }

  function playChord(notes: number[]) {
    notes.forEach(n => playTone(n, 0));
  }

  function playTone(noteValue: number, when = 0) {
    if (audioContext && bufferLoader?.audioBuffers) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.2;

      const sampleInfo = getSampleForNote(noteValue);
      source.buffer = bufferLoader.audioBuffers[sampleInfo.sample]

      // we're saying that octave 0 is octave below middle C
      // noteValue is based on C = 0, need to subtract 18 semitones as sample is A440
      source.detune.value = (sampleInfo.detune) * 100;
      //source.detune.value = (noteValue - 18) * 100;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(audioContext.currentTime + when);
    }
  }

  useEffect(() => {
    function createAudioContext() {
      if (typeof AudioContext !== 'undefined') {
        setAudioContext(new AudioContext());
      } else if (typeof window.webkitAudioContext !== 'undefined') {
        setAudioContext(new window.webkitAudioContext());
      } else {
        console.error('Web Audio API is not supported in this browser');
      }

      setInit(true);
    }

    if (!init) {
      document.addEventListener('click', createAudioContext);
    }

    return () => {
      document.removeEventListener('click', createAudioContext);
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
    <AudioReactContext.Provider value={{
      audioContext,
      playSequence,
      playChord,
      playTone
    }}>
      {children}
    </AudioReactContext.Provider>
  );
}


