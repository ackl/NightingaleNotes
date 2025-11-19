import type { ReactNode } from 'react';
import {
  useCallback, useMemo, useState, createContext,
  useEffect,
} from 'react';
import { Note, TONALITY } from '../lib';

interface Settings {
  showIvoryLabels: boolean;
  onlyInKey: boolean;
  setOnlyInKey: (arg: boolean) => void;
  octaves: number;
  tonality: TONALITY;
  setTonality: (arg: TONALITY) => void;
  tonic: Note;
  setTonic: (arg: Note) => void;
  increaseOctaves: () => void;
  decreaseOctaves: () => void;
  setShowIvoryLabels: (arg: boolean) => void;
  octaveForMusicalKeyboard: number;
  setOctaveForMusicalKeyboard: (arg: number) => void;
}

export const initialSettingsState: Settings = {
  showIvoryLabels: false,
  onlyInKey: true,
  setOnlyInKey: () => { },
  octaves: 2,
  tonality: TONALITY.MAJOR,
  setTonality: () => { },
  tonic: 0,
  setTonic: () => { },
  increaseOctaves: () => { },
  decreaseOctaves: () => { },
  setShowIvoryLabels: () => { },
  octaveForMusicalKeyboard: 0,
  setOctaveForMusicalKeyboard: () => { },
};

export const SettingsContext = createContext<Settings>(initialSettingsState);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showIvoryLabels, setShowIvoryLabels] = useState(
    initialSettingsState.showIvoryLabels,
  );
  const [onlyInKey, setOnlyInKey] = useState(initialSettingsState.onlyInKey);
  const [octaves, setOctaves] = useState(initialSettingsState.octaves);
  const [octaveForMusicalKeyboard, setOctaveForMusicalKeyboard] = useState(
    initialSettingsState.octaveForMusicalKeyboard
  );
  const [tonality, setTonality] = useState<TONALITY>(initialSettingsState.tonality);
  const [tonic, setTonic] = useState<Note>(0);

  const increaseOctaves = useCallback(() => {
    setOctaves((prev) => (prev > 3 ? 4 : prev + 1));
  }, []);

  const decreaseOctaves = useCallback(() => {
    setOctaves((prev) => (prev < 3 ? 2 : prev - 1));
  }, []);

  const contextValue = useMemo(() => ({
    showIvoryLabels,
    setShowIvoryLabels,
    onlyInKey,
    setOnlyInKey,
    octaves,
    tonality,
    setTonality,
    tonic,
    setTonic,
    increaseOctaves,
    decreaseOctaves,
    octaveForMusicalKeyboard,
    setOctaveForMusicalKeyboard,
  }), [
    showIvoryLabels,
    setShowIvoryLabels,
    onlyInKey,
    setOnlyInKey,
    octaves,
    tonality,
    setTonality,
    tonic,
    setTonic,
    increaseOctaves,
    decreaseOctaves,
    octaveForMusicalKeyboard,
    setOctaveForMusicalKeyboard,

  ]);

  useEffect(() => {
    function handleKeyPress(ev: KeyboardEvent) {
      if (ev.key.toLowerCase() === 'z') {
        // lower octave
        if (octaveForMusicalKeyboard !== 0) {
          setOctaveForMusicalKeyboard(octaveForMusicalKeyboard - 1);
        }
      } else if (ev.key.toLowerCase() === 'x') {
        // upper octave
        if (octaveForMusicalKeyboard !== 5) {
          setOctaveForMusicalKeyboard(octaveForMusicalKeyboard + 1);
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress);

    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [octaveForMusicalKeyboard]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
