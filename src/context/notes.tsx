import type { ReactNode } from 'react';
import {
  useState, useEffect, useMemo, useContext, createContext,
} from 'react';
import { SettingsContext } from './settings';
import {
  getKeySignatures,
  buildDiatonicTriads,
  Note,
  Sequence,
  KeySignature,
  TONALITY,
} from '../lib';

interface NotesState {
  diatonicChordRoot?: Note;
  setDiatonicChordRoot: (arg?: Note) => void;
  keySignatures: KeySignature[];
  keySignature: KeySignature;
  chosenKeySigIdx: number;
  setChosenKeySigIdx: (arg: number) => void;
  chord?: Sequence;
}

const initialNotesState: NotesState = {
  setDiatonicChordRoot: () => { },
  setChosenKeySigIdx: () => { },
  keySignatures: getKeySignatures(0, TONALITY.MAJOR),
  keySignature: getKeySignatures(0, TONALITY.MAJOR)[0],
  chosenKeySigIdx: 0,
};

export const NotesContext = createContext<NotesState>(initialNotesState);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [diatonicChordRoot, setDiatonicChordRoot] = useState<
    Note | undefined
  >();
  const [keySignatures, setKeySignatures] = useState<KeySignature[]>(
    initialNotesState.keySignatures,
  );
  const [chosenKeySigIdx, setChosenKeySigIdx] = useState<number>(
    initialNotesState.chosenKeySigIdx,
  );

  const { tonality, tonic } = useContext(SettingsContext);

  useEffect(() => {
    const keySigs = getKeySignatures(tonic, tonality);
    if (keySigs.length < 2) {
      setChosenKeySigIdx(0);
    }
    setKeySignatures(keySigs);
  }, [tonic, tonality]);

  const keySignature = keySignatures[chosenKeySigIdx];
  const diatonicChords = buildDiatonicTriads(tonic, tonality);
  const chord = diatonicChords && diatonicChordRoot !== undefined
    ? diatonicChords[diatonicChordRoot]
    : undefined;

  const contextValue = useMemo(() => ({
    chord,
    diatonicChordRoot,
    setDiatonicChordRoot,
    keySignatures,
    keySignature,
    chosenKeySigIdx,
    setChosenKeySigIdx,
  }), [
    chord,
    diatonicChordRoot,
    setDiatonicChordRoot,
    keySignatures,
    keySignature,
    chosenKeySigIdx,
    setChosenKeySigIdx,

  ]);

  return (
    <NotesContext.Provider
      value={contextValue}
    >
      {children}
    </NotesContext.Provider>
  );
}
