import { useState, useEffect, useContext, createContext } from 'react'
import type { ReactNode } from 'react'
import { notes, getMajorScale, whiteKeys, getNoteLabel, getEnharmonicLabel, getMajorKeyLabel } from './lib';
import type { Note } from './lib';
import abcjs from 'abcjs';
import './App.css'

function Ivory({
  note,
  tonic,
  isFirstOctave,
  isLastOctave,
  scaleNotes
}: {
  note: Note,
  tonic: Note,
  isFirstOctave: boolean,
  isLastOctave: boolean,
  scaleNotes?: ScaleNotes
}) {
  const isWhiteKey = whiteKeys.includes(note);
  const {showIvoryLabels, onlyInKey} = useContext(SettingsContext);
  const {setTonic} = useContext(NotesContext);

  let isNoteInScale = scaleNotes?.includes(note);
  if (isFirstOctave && (note < tonic)) isNoteInScale = false;
  if (isLastOctave && (note > tonic)) isNoteInScale = false;

  return (
    <div
      className={`key key--${note} ${isWhiteKey ? 'white' : 'black'}${isNoteInScale ? ' in-scale' : ''}`}
      onClick={() => {
        setTonic(note);
      }}
    >
      <span className={`ivory-label ${showIvoryLabels && 'show'}`}>
        {onlyInKey ? isNoteInScale && getNoteLabel(tonic, note) : getNoteLabel(tonic, note)}
      </span>
    </div>
  )
}

function Octave(props: {
  scaleNotes?: ScaleNotes,
  isFirstOctave: boolean,
  isLastOctave: boolean
  tonic: Note
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

function Keyboard({
  tonic,
  scale
}: {
  tonic: Note,
  scale?: Scale
}) {
  const { octaves } = useContext(SettingsContext);

  const els = [];
  for (let i = 0; i < octaves; i++) {
    els.push(
      <Octave
        key={i}
        tonic={tonic}
        scaleNotes={scale?.scaleNotes}
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

function KeySignature({ tonic }: { tonic: Note }) {
  useEffect(() => {
    const key = getMajorKeyLabel(tonic);
    abcjs.renderAbc("paper", `X:1\nK:${key}\n|`);
  }, [tonic]);

  return <div id="paper"></div>
}

interface Settings {
  showIvoryLabels: boolean;
  onlyInKey: boolean;
  octaves: number;
}

const initialSettingsState = {
  showIvoryLabels: false,
  onlyInKey: true,
  octaves: 2
}

const SettingsContext = createContext<Settings>(initialSettingsState);

const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [showIvoryLabels, setShowIvoryLabels] = useState(initialSettingsState.showIvoryLabels);
  const [onlyInKey, setOnlyInKey] = useState(initialSettingsState.onlyInKey);
  const [octaves, setOctaves] = useState(initialSettingsState.octaves);

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
    <SettingsContext.Provider value={{showIvoryLabels, onlyInKey, octaves}}>
      {children}
      <div className='settings-controls'>
        <ShowHideButton />
        <OnlyInKey />
      </div>
      <div className='octaves-controls'>
        <OctavesButtons />
      </div>
    </SettingsContext.Provider>
  );
};

interface NotesState {
  tonic: Note;
  setTonic: (arg: Note) => void;
  scale?: Scale;
}

const initialNotesState: NotesState = {
  tonic: 0,
  setTonic: () => {},
}

const NotesContext = createContext<NotesState>(initialNotesState);

const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [tonic, setTonic] = useState<Note>(0);
  const [scale, setScale] = useState<Scale | undefined>();

  useEffect(() => {
    const scale = getMajorScale(tonic);
    setScale(scale);
  }, [tonic]);

  return (
    <NotesContext.Provider value={{tonic, setTonic, scale}}>
      {children}
    </NotesContext.Provider>
  );
}


function App() {
  const { tonic, scale, setTonic } = useContext(NotesContext);

  return (
    <SettingsProvider>
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
                {getEnharmonicLabel(n)}
              </option>
            ))}
          </select>
        </section>

        <KeySignature tonic={tonic} />

        <Keyboard
          tonic={tonic}
          scale={scale}
        />
      </main>
    </SettingsProvider>
  )
}

function ProviderWrapper() {
  return (
    <NotesProvider><App /></NotesProvider>
  )
}

export default ProviderWrapper
