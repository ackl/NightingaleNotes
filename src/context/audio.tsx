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

export const AudioReactProvider = ({ children }: { children: ReactNode }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [init, setInit] = useState(false);
  const [noteArrayBuffer, setNoteArrayBuffer] = useState<ArrayBuffer>();
  const [pianoSample, setPianoSample] = useState<AudioBuffer | null>(null);

  function playSequence(notes: number[]) {
    notes.forEach((n, i) => {
      playTone(n, i / 4)
    });
  }

  function playChord(notes: number[]) {
    notes.forEach(playTone);
  }

  function playTone(noteValue: number, when = 0) {
    if (audioContext && pianoSample) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.3;
      source.buffer = pianoSample;
      // noteValue is based on C = 0, need to subtract 9 semitones as sample is A440
      source.detune.value = (noteValue - 9) * 100;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(when);
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
    fetch('/a3.mp3')
      .then((response) => response.arrayBuffer())
      .then((buffer) => setNoteArrayBuffer(buffer));
  }, []);

  useEffect(() => {
    if (audioContext && noteArrayBuffer) {
      audioContext.decodeAudioData(noteArrayBuffer)
        .then((sample) => {
          setPianoSample(sample);
        });
    }
  }, [noteArrayBuffer, audioContext]);

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


