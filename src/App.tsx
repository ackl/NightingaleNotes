import { useState, useEffect, useContext, createContext } from 'react'
import type { ReactNode } from 'react'
import {
  TONALITY,
  notes,
  getScale,
  whiteKeys,
  getNoteLabel,
  getMajorKeyLabel,
  getMinorKeyLabel,
  buildDiatonicTriads,
  getDiatonicChordRomanNumerals,
  diatonicDegreeNames
} from './lib';
import abcjs from 'abcjs';
import './App.css'

function Ivory({
  note,
  isFirstOctave,
  isLastOctave,
}: {
  note: Note,
  isFirstOctave: boolean,
  isLastOctave: boolean,
}) {
  const isWhiteKey = whiteKeys.includes(note);
  const {showIvoryLabels, onlyInKey, tonality} = useContext(SettingsContext);
  const {tonic, setTonic, scale, chord} = useContext(NotesContext);

  const noteLabel = getNoteLabel(tonic, note, tonality);

  let isNoteInScale = scale?.scaleNotes.includes(note);
  let isHighlight = true;

  if (chord) {
    isHighlight = chord.notes.includes(note);
    if (isFirstOctave && (note < chord.notes[0])) isHighlight = false;
    if (isLastOctave && (note > chord.notes[0])) isHighlight = false;
  } else {
    isHighlight = scale?.scaleNotes.includes(note) || false;
    if (isFirstOctave && (note < tonic)) isHighlight = false;
    if (isLastOctave && (note > tonic)) isHighlight = false;
  }


  return (
    <div
      className={
        `key key--${note} ${isWhiteKey ? 'white' : 'black'}${isHighlight ? ' in-scale' : ''}${chord ? ' chord' : ''}`
      }
      onClick={() => {
        setTonic(note);
      }}
    >
      <span className={`ivory-label ${showIvoryLabels && 'show'}`}>
        {onlyInKey ? isNoteInScale && noteLabel : noteLabel}
      </span>
    </div>
  )
}

function Octave(props: {
  isFirstOctave: boolean,
  isLastOctave: boolean
}) {
  return (
    <>
      {
        notes.map(note => (
          <Ivory
            {...props}
            note={note}
            key={note}
          />
        ))
      }
    </>
  )
}

function Keyboard() {
  const { octaves } = useContext(SettingsContext);

  const els = [];
  for (let i = 0; i < octaves; i++) {
    els.push(
      <Octave
        key={i}
        isFirstOctave={i === 0}
        isLastOctave={i === (octaves - 1)}
      />
    )
  }

  return (
    <>
    <section className='keyboard'>
      {els.map(el => el)}
    </section>
    </>
  )
}

function KeySignature() {
  const { tonality } = useContext(SettingsContext);
  const { tonic, chord } = useContext(NotesContext);

  useEffect(() => {
    const key = tonality === TONALITY.MAJOR ?
      getMajorKeyLabel(tonic) : getMajorKeyLabel((tonic + 3) % 12 as Note);
    //let notes = '';

    //if (chord) {
      //notes = `[${chord.labels.join('')}]`;
    //}

    abcjs.renderAbc('paper', `X:1\nK:${key}\n|\n`);

  }, [tonic, chord, tonality]);

  return <div id='paper'></div>
}

interface Settings {
  showIvoryLabels: boolean;
  onlyInKey: boolean;
  octaves: number;
  tonality: TONALITY
  setTonality: (arg: TONALITY) => void;
}

const initialSettingsState = {
  showIvoryLabels: false,
  onlyInKey: true,
  octaves: 2,
  tonality: TONALITY['MAJOR'],
  setTonality: () => {},
}

const SettingsContext = createContext<Settings>(initialSettingsState);

const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [showIvoryLabels, setShowIvoryLabels] = useState(initialSettingsState.showIvoryLabels);
  const [onlyInKey, setOnlyInKey] = useState(initialSettingsState.onlyInKey);
  const [octaves, setOctaves] = useState(initialSettingsState.octaves);
  const [tonality, setTonality] = useState<TONALITY>(initialSettingsState.tonality);

  function ShowHideButton() {
    return <button
      onClick={() => {
        setShowIvoryLabels(!showIvoryLabels)
      }}
    >
      {`${showIvoryLabels ? 'hide' : 'show'} labels on keys`}
    </button>
  }

  function OnlyInKey() {
    return showIvoryLabels && <button
      onClick={() => {
        setOnlyInKey(!onlyInKey)
      }}
    >
      {`${onlyInKey ? 'all keys' : 'only in scale'}`}
    </button>
  }

  function OctavesButtons() {
    return <div>
      <label>number of octaves: {octaves}</label>
      <button onClick={() => setOctaves((prev) => prev > 4 ? 5 : prev + 1)}>+</button>
      <button onClick={() => setOctaves((prev) => prev < 3 ? 2 : prev - 1)}>-</button>
    </div>
  }

  return (
    <SettingsContext.Provider value={{
        showIvoryLabels,
        onlyInKey,
        octaves,
        tonality,
        setTonality
    }}>
      {children}
      <div className='settings-controls'>
        <ShowHideButton />
        <OnlyInKey />
      </div>
      <div className='octaves-controls'>
        <OctavesButtons />
      </div>
      <div className='tonality-controls'>
        <p>current tonality: {tonality}</p>
        {Object.entries(TONALITY).map(([t, label]) => {
          return (
            <button key={label} onClick={() => {
              setTonality(TONALITY[t as keyof typeof TONALITY])
            }}>{label}</button>
          )
        })}
      </div>
    </SettingsContext.Provider>
  );
};

interface NotesState {
  tonic: Note;
  setTonic: (arg: Note) => void;
  diatonicChordRoot?: Note;
  setDiatonicChordRoot: (arg?: Note) => void;
  scale?: Scale;
  chord?: Chord;
}

const initialNotesState: NotesState = {
  tonic: 0,
  setTonic: () => {},
  setDiatonicChordRoot: () => {},
}
const NotesContext = createContext<NotesState>(initialNotesState);

const NotesProvider = ({ children }: { children: ReactNode }) => {
  const {tonality} = useContext(SettingsContext);
  const [tonic, setTonic] = useState<Note>(0);
  const [scale, setScale] = useState<Scale | undefined>();
  const [diatonicChords, setDiatonicChords] = useState<Chord[] | undefined>();
  const [diatonicChordRoot, setDiatonicChordRoot] = useState<Note | undefined>();
  const [chord, setChord] = useState<Chord | undefined>();

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
    <NotesContext.Provider value={{tonic, setTonic, scale, chord, diatonicChordRoot, setDiatonicChordRoot}}>
      {children}
    </NotesContext.Provider>
  );
}


function App() {
  const {tonic, setTonic, diatonicChordRoot, setDiatonicChordRoot} = useContext(NotesContext);
  const {tonality} = useContext(SettingsContext);

  return (
      <main>
        <section>
          <label htmlFor="key">Select a key:</label>
          <select
            id="key"
            onChange={(ev) => {
              setTonic(Number(ev.target.value) as Note)
            }}
            value={tonic}
          >
            {notes.map(n => (
              <option value={n} key={n}>
                {tonality === TONALITY.MAJOR ? getMajorKeyLabel(n) : getMinorKeyLabel(n)}
              </option>
            ))}
          </select>
        </section>

        <KeySignature />

        <Keyboard />
        <div>
          {getDiatonicChordRomanNumerals(tonality).map((label, i) => (
            <button
              key={label}
              onClick={() => {
                // set i as degree of scale for root of diatonic chords
                if (diatonicChordRoot === i) {
                  setDiatonicChordRoot();
                } else {
                  setDiatonicChordRoot(i as Note)
                }
              }}
              className={`${diatonicChordRoot === i ? 'active' : ''}`}
            >{label}</button>
          ))}
        </div>
        <p>{diatonicChordRoot !== undefined && diatonicDegreeNames[diatonicChordRoot]}</p>
      </main>
    )
}

function ProviderWrapper() {
  return (
    <SettingsProvider>
      <NotesProvider>
        <App />
      </NotesProvider>
    </SettingsProvider>
  )
}

export default ProviderWrapper;
