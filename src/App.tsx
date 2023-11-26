import { useContext } from 'react'
import {
  TONALITY,
  notes,
  getMajorKeyLabel,
  getMinorKeyLabel,
} from './lib';
import './App.css'
import { NotesContext, SettingsContext, AudioReactContext } from './context'
import { KeySignature } from './components/keySignature'
import { Keyboard } from './components/keyboard'


function App() {
  const {tonality, tonic, setTonic} = useContext(SettingsContext);
  const {scale, chord} = useContext(NotesContext);
  const {audioContext, playSequence} = useContext(AudioReactContext);

  return (
      <main>
        <section className="key-selector">
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

        <button
          className='play'
          onClick={() => {
            if (!audioContext) {
              setTimeout(() => {
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                });

                setTimeout(() => {
                  document.querySelector('.play')?.dispatchEvent(clickEvent);
                }, 100);
              }, 1);
            } else {
              const sequence = chord ? chord : scale;
              if (sequence) {
                const max = Math.max(...sequence.notes);
                const maxIdx = sequence.notes.indexOf(max as Note);

                // rearrange so that whole array of notes is only
                // ascending numbers without the modulo 12
                // this is so that the audioContext sample can use this value
                // to determine how to detune the A440 sample
                const lower = sequence.notes.slice(0, maxIdx + 1);
                const upper = sequence.notes.slice(maxIdx + 1).map(x => x + 12);

                // since we build notes of a heptatonic add back the octave
                const sequenceNotes = [...lower, ...upper, lower[0] + 12];
                playSequence(sequenceNotes);
              }
            }
          }}
        >play me</button>
      </main>
    )
}

export default App;
