import type { ReactNode } from 'react'
import { useState, useEffect, createContext } from 'react'


interface AudioContextState {
  audioContext: AudioContext | null;
  playPianoNote: (n: number) => void;
  getFrequency: (n: Note) => number;
  playSequence: (n: number[]) => void;
}

const initialAudioContextState: AudioContextState = {
  audioContext: null,
  playPianoNote: () => {},
  getFrequency: () => 0,
  playSequence: () => {}
}

export const AudioReactContext = createContext<AudioContextState>(initialAudioContextState);

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

const twelveTETSemitoneRatio = 2 ** (1 / 12);
const A = 440

export const AudioReactProvider = ({ children }: { children: ReactNode }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [init, setInit] = useState(false);

  function playPianoNote(note: number) {
    if (audioContext) {
      var oscillator = audioContext.createOscillator();
      var gainNode = audioContext.createGain();

      oscillator.type = 'sine'; // You can change the type to 'sine', 'square', 'sawtooth', or 'triangle'
      oscillator.frequency.value = note;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Fade out the sound
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }

  // Function to map note names to frequencies
  function getFrequency(note: Note) {
    const noteMap: Record<Note, number> = {
      0: A / (twelveTETSemitoneRatio ** 9),
      1: A / (twelveTETSemitoneRatio ** 8),
      2: A / (twelveTETSemitoneRatio ** 7),
      3: A / (twelveTETSemitoneRatio ** 6),
      4: A / (twelveTETSemitoneRatio ** 5),
      5: A / (twelveTETSemitoneRatio ** 4),
      6: A / (twelveTETSemitoneRatio ** 3),
      7: A / (twelveTETSemitoneRatio ** 2),
      8: A / twelveTETSemitoneRatio,
      9: A,
      10: A * twelveTETSemitoneRatio,
      11: A * (twelveTETSemitoneRatio ** 2),
    };

    return noteMap[note] || 0;
  }

  //function delayedFunction(freqs: number[], n: number) {
    //playPianoNote(freqs[n]);
  //}

  function playSequence(freqs: number[]) {
    const delay = 200; // Delay in milliseconds
    let iterations = freqs.length; // Number of iterations
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
        //delayedFunction(freqs, freqs.length - iterations);
        playPianoNote(freqs[ freqs.length - iterations ]);
        iterations--;

        if (iterations > 0) {
          requestAnimationFrame(runIteration);
        }
      }
    }

    requestAnimationFrame(runIteration);
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

  return (
    <AudioReactContext.Provider value={{
      audioContext,
      playPianoNote,
      getFrequency,
      playSequence
    }}>
      {children}
    </AudioReactContext.Provider>
  );
}


