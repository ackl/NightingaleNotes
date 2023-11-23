import { useState, useEffect } from 'react'
import { notes, getMajorScale, whiteKeys, getNoteLabel, getEnharmonicLabel } from './lib';
import type { Note } from './lib';
import './App.css'

function Note({
  note,
  isFirstOctave,
  isLastOctave,
  scaleNotes
}: {
  note: Note,
  isFirstOctave: boolean,
  isLastOctave: boolean,
  scaleNotes?: ScaleNotes
}) {
  const isWhiteKey = whiteKeys.includes(note);
  const tonic = scaleNotes?.[0];

  let isNoteInScale = scaleNotes?.includes(note);

  if (isFirstOctave) {
    if ((tonic !== undefined) && (note < tonic)) {
      console.log("FIRST OCTAVE, CHECKING", note, tonic);
      isNoteInScale = false;
    }
  }

  if (isLastOctave) {
    console.log("LAST OCTAVE, CHECKING", note, tonic);
    if ((tonic !== undefined) && (note > tonic)) {
      console.log("HIT", note, tonic);
      isNoteInScale = false;
    }
  }

  return (
    <div
      className={`key ${isWhiteKey ? 'white' : 'black'} ${isNoteInScale ? 'inScale' : ''}`}
      onClick={() => {
        console.log("CLICKED", note, isWhiteKey);
      }}
    ></div>
  )
}

function Octave(props: {
  scaleNotes?: ScaleNotes,
  isFirstOctave: boolean,
  isLastOctave: boolean
}) {
  return (
    <>
      {
        notes.map(note => (
          <Note
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
  octaves,
  scale
}: {
  octaves: number,
  scale?: Scale
}) {
  const els = [];
  for (let i = 0; i < octaves; i++) {
    els.push(
      <Octave
        scaleNotes={scale?.scaleNotes}
        isFirstOctave={i === 0}
        isLastOctave={i === (octaves - 1)}
      />
    )
  }

  return (
    <section className='keyboard'>
      {els.map(el => el)}
    </section>
  )
}

function App() {
  const [tonic, setTonic] = useState<Note>(0);
  const [scale, setScale] = useState<Scale | undefined>();

  useEffect(() => {
    const scale = getMajorScale(tonic);
    console.log(scale);
    setScale(scale);
  }, [tonic]);

  return (
    <main>
      <section>
        <label htmlFor="key">Select a key:</label>
        <select id="key" onChange={(ev) => {
          console.log('ha', ev.target.value);
          console.log(typeof ev.target.value);
          setTonic(Number(ev.target.value) as Note)
        }}>
          {notes.map(n => (
            <option value={n} key={n}>
              {getEnharmonicLabel(n)}
            </option>
          ))}
        </select>

      {scale &&
        <div>
          {
            scale.scaleLabels.map(n => <span>{n}</span>)
          }
        </div>
      }

      <div className="stave-header">
      </div>

      </section>

      <Keyboard scale={scale} octaves={2} />
    </main>
  )
}

export default App
