import type { ReactNode } from 'react'
import { useEffect, useContext, createContext } from 'react'
import { SettingsContext } from './settings'
import { AudioReactContext } from './audio'
import { NotesContext } from './notes'
import { TONALITY, } from '../lib';

interface A11yState {
}

const initialA11yState: A11yState = {
}

export const A11yContext = createContext<A11yState>(initialA11yState);

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const {
    tonality,
    setTonality,
    tonic,
    setTonic,
  } = useContext(SettingsContext);

  const {
    playNotes
  } = useContext(AudioReactContext);

  const {
    chord,
    scale,
    diatonicChordRoot,
    setDiatonicChordRoot
  } = useContext(NotesContext);

  function handleTriad(ev: KeyboardEvent) {
    // 0 1 2 3 4 5
    // D i g i t 1
    const noteInScale = (parseInt(ev.code[5]) -1) as Note
    if (diatonicChordRoot === noteInScale) {
      setDiatonicChordRoot(undefined);
    } else {
      setDiatonicChordRoot(noteInScale)
    }
  }

  function handleTonality(prev: boolean) {
    const values = Object.values(TONALITY);
    const keys = Object.keys(TONALITY);
    const currentIndex = values.indexOf(tonality);

    // calculate the next index,
    // wrapping around to 0 if it's at the end
    // or wrapping around to end if it's at the start
    const nextIndex = prev ?
    (currentIndex - 1 + values.length) % values.length :
    (currentIndex + 1) % values.length

    setTonality(TONALITY[keys[nextIndex]])
  }

  function goToRelative() {
    if (tonality === TONALITY.MAJOR) {
      setTonic((tonic + 9) % 12 as Note);
      setTonality(TONALITY.MINOR_NATURAL);
    } else {
      setTonality(TONALITY.MAJOR);
      setTonic((tonic + 3) % 12 as Note);
    }
  }

  useEffect(() => {
    function callback(ev: KeyboardEvent) {
      let newTonic: Note;

      switch (ev.code) {
        case "Space":
          playNotes((chord || scale) as Sequence);
          ev.preventDefault();
          break;
        case "KeyJ":
        case "ArrowUp":
          newTonic = ((tonic - 1 + 12) % 12) as Note
          setTonic(newTonic)
          break;
        case "KeyK":
        case "ArrowDown":
          newTonic = (tonic + 1) % 12 as Note
          setTonic(newTonic)
          break;
        case "KeyH":
        case "ArrowLeft":
          handleTonality(true);
          break;
        case "KeyL":
        case "ArrowRight":
          handleTonality(false);
          break;
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
          handleTriad(ev);
          break;
        case "KeyM":
          goToRelative();
          break;
      }
    }

    document.addEventListener('keydown', callback);

    return () => {
      document.removeEventListener('keydown', callback);
    }
  }, [chord, scale, tonic, setTonic, tonality, setTonality])



  return (
    <A11yContext.Provider value={{
    }}>
      {children}
    </A11yContext.Provider>
  );
}

