import type { ReactNode } from 'react'
import { useState, useEffect, useContext, createContext } from 'react'
import { SettingsContext } from './settings'
import {
  getKeySignatures,
  buildDiatonicTriads,
  getDiatonicChordRomanNumerals,
  diatonicDegreeNames,
  Note,
  Sequence,
  KeySignature,
  TONALITY
} from '../lib';


interface NotesState {
  diatonicChordRoot?: Note;
  setDiatonicChordRoot: (arg?: Note) => void;
  keySignatures: KeySignature[],
  keySignature: KeySignature,
  chosenKeySigIdx: number;
  setChosenKeySigIdx: (arg: number) => void;
  chord?: Sequence;
}

const initialNotesState: NotesState = {
  setDiatonicChordRoot: () => {},
  setChosenKeySigIdx: () => {},
  keySignatures: getKeySignatures(0, TONALITY.MAJOR),
  keySignature: getKeySignatures(0, TONALITY.MAJOR)[0],
  chosenKeySigIdx: 0
}

export const NotesContext = createContext<NotesState>(initialNotesState);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [diatonicChordRoot, setDiatonicChordRoot] = useState<Note | undefined>();
  const [keySignatures, setKeySignatures] = useState<KeySignature[]>(initialNotesState.keySignatures);
  const [chosenKeySigIdx, setChosenKeySigIdx] = useState<number>(initialNotesState.chosenKeySigIdx);

  const {
    tonality,
    tonic,
  } = useContext(SettingsContext);

  useEffect(() => {
    const keySigs = getKeySignatures(tonic, tonality)
    if (keySigs.length < 2) {
      setChosenKeySigIdx(0);
    }
    setKeySignatures(keySigs);
  }, [tonic, tonality]);


  const keySignature = keySignatures[chosenKeySigIdx];
  const diatonicChords = buildDiatonicTriads(keySignature);
  const chord = (diatonicChords && diatonicChordRoot !== undefined) ? diatonicChords[diatonicChordRoot] : undefined;

  return (
    <NotesContext.Provider value={{
      chord,
      diatonicChordRoot,
      setDiatonicChordRoot,
      keySignatures,
      keySignature,
      chosenKeySigIdx,
      setChosenKeySigIdx
    }}>
      {children}
      <div className='diatonic-chords'>
        <h3>diatonic triads</h3>
        {getDiatonicChordRomanNumerals(tonality).map((label, i) => (
          <button
            key={label}
            onClick={() => {
              // set i as degree of scale for root of diatonic chords
              if (diatonicChordRoot === i) {
                setDiatonicChordRoot(undefined);
              } else {
                setDiatonicChordRoot(i as Note)
              }
            }}
            className={`${diatonicChordRoot === i ? 'active' : ''}`}
          >{label}</button>
        ))}
      </div>
        <p className='degree-name'>{diatonicChordRoot !== undefined && diatonicDegreeNames[diatonicChordRoot]}</p>
    </NotesContext.Provider>
  );
}

