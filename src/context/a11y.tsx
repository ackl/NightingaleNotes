import type { ReactNode } from 'react';
import {
  createContext, useCallback, useContext, useEffect,
} from 'react';
import { SettingsContext } from './settings';
import { AudioReactContext } from './audio';
import { NotesContext } from './notes';
import { Note, TONALITY } from '../lib';

export const A11yContext = createContext<null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const {
    tonality,
    setTonality,
    tonic,
    setTonic,
    octaves,
    increaseOctaves,
    decreaseOctaves,
    showIvoryLabels,
    onlyInKey,
    setShowIvoryLabels,
    setOnlyInKey,
  } = useContext(SettingsContext);

  const { audioContextManager } = useContext(AudioReactContext);

  const {
    chord, keySignature, diatonicChordRoot, setDiatonicChordRoot,
  } = useContext(NotesContext);

  const handleTriad = useCallback(
    (ev: KeyboardEvent) => {
      /* 0 1 2 3 4 5
       * D i g i t 1
       * ev.code will be like Digit1 Digit2 etc based on which
       * digit key they pressed, so we just take the number and
       * typecast it */
      const noteInScale = (parseInt(ev.code[5], 10) - 1) as Note;
      if (diatonicChordRoot === noteInScale) {
        setDiatonicChordRoot(undefined);
      } else {
        setDiatonicChordRoot(noteInScale);
      }
    },
    [diatonicChordRoot, setDiatonicChordRoot],
  );

  const handleTonality = useCallback(
    (prev: boolean) => {
      const entries = Object.entries(TONALITY);
      const currentIndex = entries.findIndex(
        ([_, value]) => value === tonality,
      );
      const nextIndex = (currentIndex + (prev ? -1 : 1) + entries.length) % entries.length;
      setTonality(entries[nextIndex][1]);
    },
    [tonality, setTonality],
  );

  const goToRelative = useCallback(() => {
    if (tonality === TONALITY.MAJOR) {
      setTonic(((tonic + 9) % 12) as Note);
      setTonality(TONALITY.MINOR_NATURAL);
    } else {
      setTonality(TONALITY.MAJOR);
      setTonic(((tonic + 3) % 12) as Note);
    }
  }, [tonic, setTonic, tonality, setTonality]);

  const handleShowLabels = useCallback(() => {
    setShowIvoryLabels(!showIvoryLabels);
  }, [showIvoryLabels, setShowIvoryLabels]);

  const handleShowAllLabels = useCallback(() => {
    setOnlyInKey(!onlyInKey);
  }, [onlyInKey, setOnlyInKey]);

  const keypressCallback = useCallback(
    (ev: KeyboardEvent) => {
      let newTonic: Note;

      switch (ev.code) {
        case 'Space':
          audioContextManager?.playNotes(chord || keySignature.scaleAscending, octaves);
          ev.preventDefault();
          break;
        case 'KeyJ':
        case 'ArrowUp':
          newTonic = ((tonic - 1 + 12) % 12) as Note;
          setTonic(newTonic);
          break;
        case 'KeyK':
        case 'ArrowDown':
          newTonic = ((tonic + 1) % 12) as Note;
          setTonic(newTonic);
          break;
        case 'KeyS':
          handleShowLabels();
          break;
        case 'KeyA':
          handleShowAllLabels();
          break;
        case 'KeyH':
        case 'ArrowLeft':
          handleTonality(true);
          break;
        case 'KeyL':
        case 'ArrowRight':
          handleTonality(false);
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
          handleTriad(ev);
          break;
        case 'KeyM':
          goToRelative();
          break;
        case 'Equal':
          increaseOctaves();
          break;
        case 'Minus':
          decreaseOctaves();
          break;
        default:
          break;
      }
    },
    [
      octaves,
      audioContextManager,
      chord,
      keySignature,
      tonic,
      setTonic,
      increaseOctaves,
      decreaseOctaves,
      goToRelative,
      handleTonality,
      handleShowAllLabels,
      handleTriad,
      handleShowLabels,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', keypressCallback);
    return () => document.removeEventListener('keydown', keypressCallback);
  }, [keypressCallback]);

  return <A11yContext.Provider value={null}>{children}</A11yContext.Provider>;
}
