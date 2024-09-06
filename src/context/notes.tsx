import type { ReactNode } from 'react'
import { useState, useEffect, useContext, createContext } from 'react'
import { SettingsContext } from './settings'
import {
  getScale,
  buildDiatonicTriads,
  getDiatonicChordRomanNumerals,
  diatonicDegreeNames
} from '../lib';


interface NotesState {
  diatonicChordRoot?: Note;
  setDiatonicChordRoot: (arg?: Note) => void;
  scale?: Sequence;
  setScale: (arg: Sequence) => void,
  chord?: Sequence;
  setChord: (arg?: Sequence) => void;
}

const initialNotesState: NotesState = {
  setDiatonicChordRoot: () => {},
  setScale: () => {},
  setChord: () => {},
}

export const NotesContext = createContext<NotesState>(initialNotesState);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [scale, setScale] = useState<Sequence | undefined>();
  const [diatonicChords, setDiatonicChords] = useState<Sequence[] | undefined>();
  const [diatonicChordRoot, setDiatonicChordRoot] = useState<Note | undefined>();
  const [chord, setChord] = useState<Sequence | undefined>();

  const {
    tonality,
    tonic,
  } = useContext(SettingsContext);

  useEffect(() => {
    setScale(getScale(tonic, tonality));
    setDiatonicChords(buildDiatonicTriads(tonic, tonality))
  }, [tonic, tonality]);

  useEffect(() => {
    if (diatonicChords && diatonicChordRoot !== undefined) {
      setChord(diatonicChords[diatonicChordRoot]);
    } else {
      setChord(undefined);
    }
  }, [diatonicChordRoot, diatonicChords]);

  return (
    <NotesContext.Provider value={{
      scale,
      setScale,
      chord,
      setChord,
      diatonicChordRoot,
      setDiatonicChordRoot
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

