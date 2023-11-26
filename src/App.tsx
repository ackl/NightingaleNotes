import { useContext, useEffect } from 'react'
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
  const {getFrequency, playPianoNote, audioContext, playSequence} = useContext(AudioReactContext);

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

                console.log("fald", audioContext);
                document.querySelector('.play')?.dispatchEvent(clickEvent);
              }, 1);
            } else {
              if (chord) {
                for (let i = 0; i < chord.notes.length; i++) {
                  setTimeout(() => {
                    playPianoNote(getFrequency(chord.notes[i]));
                  }, i * 300)
                }
              } else if (scale) {
                const max = Math.max(...scale.scaleNotes);
                const maxIdx = scale.scaleNotes.indexOf(max as Note);
                const lower = scale.scaleNotes.slice(0, maxIdx + 1);
                const upper = scale.scaleNotes.slice(maxIdx + 1);

                const freqs: number[] = lower.map(x => getFrequency(x));
                freqs.push(...upper.map(x => {return getFrequency(x) * 2}));
                //add octave
                freqs.push(freqs[0] * 2);

                playSequence(freqs);
              }
            }
          }}
        >play me</button>
      </main>
    )
}

export default App;
