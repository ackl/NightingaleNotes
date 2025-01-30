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
  // scale?: Sequence;
  // setScale: (arg: Sequence) => void,
  chord?: Sequence;
  setChord: (arg?: Sequence) => void;
}

const initialNotesState: NotesState = {
  setDiatonicChordRoot: () => {},
  setChord: () => {},
  setChosenKeySigIdx: () => {},
  keySignatures: getKeySignatures(0, TONALITY.MAJOR),
  keySignature: getKeySignatures(0, TONALITY.MAJOR)[0],
  chosenKeySigIdx: 0
}

export const NotesContext = createContext<NotesState>(initialNotesState);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [diatonicChords, setDiatonicChords] = useState<Sequence[] | undefined>();
  const [diatonicChordRoot, setDiatonicChordRoot] = useState<Note | undefined>();
  const [chord, setChord] = useState<Sequence | undefined>();
  const [keySignatures, setKeySignatures] = useState<KeySignature[]>(initialNotesState.keySignatures);
  const [keySignature, setKeySignature] = useState<KeySignature>(initialNotesState.keySignatures[initialNotesState.chosenKeySigIdx]);
  const [chosenKeySigIdx, setChosenKeySigIdx] = useState<number>(initialNotesState.chosenKeySigIdx);

  const {
    tonality,
    tonic,
  } = useContext(SettingsContext);

  useEffect(() => {
    const keySigs = getKeySignatures(tonic, tonality)
    setKeySignatures(keySigs);
  }, [tonic, tonality]);

  useEffect(() => {
    setKeySignature(keySignatures[chosenKeySigIdx]);
  }, [keySignatures, chosenKeySigIdx]);

  useEffect(() => {
    setDiatonicChords(buildDiatonicTriads(keySignature))
  }, [keySignature]);

  useEffect(() => {
    if (diatonicChords && diatonicChordRoot !== undefined) {
      setChord(diatonicChords[diatonicChordRoot]);
    } else {
      setChord(undefined);
    }
  }, [diatonicChordRoot, diatonicChords]);

  return (
    <NotesContext.Provider value={{
      chord,
      setChord,
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

