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
    const delay = 333; // Delay in milliseconds
    let iterations = notes.length; // Number of iterations
    let startTime: number | null;

    function runIteration(timestamp: number) {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsedTime = timestamp - startTime;

      if (elapsedTime < delay && iterations > 0) {
        requestAnimationFrame(runIteration);
      } else {
        startTime = null;
        // get relative note since sample is in A 440
        playTone(notes[ notes.length - iterations ] - 9);
        iterations--;

        if (iterations > 0) {
          requestAnimationFrame(runIteration);
        }
      }
    }

    requestAnimationFrame(runIteration);
  }

  function playChord(notes: number[]) {
    notes.map(n => {
      playTone(n - 9)
    });
  }

  function playTone(noteValue: number) {
    if (audioContext && pianoSample) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.3;
      source.buffer = pianoSample;
      source.detune.value = noteValue * 100;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);
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


