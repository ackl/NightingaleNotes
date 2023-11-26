import { useContext } from 'react'
import {
  TONALITY,
  notes,
  getMajorKeyLabel,
  getMinorKeyLabel,
} from './lib';
import './App.css'
import { SettingsContext } from './context'
import { KeySignature } from './components/keySignature'
import { Keyboard } from './components/keyboard'


function App() {
  const {tonality, tonic, setTonic} = useContext(SettingsContext);

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
      </main>
    )
}

export default App;
