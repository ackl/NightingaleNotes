import { useContext, useEffect, useRef } from 'react'
import {
  TONALITY,
  notes,
  getMajorKeyLabel,
  getMinorKeyLabel,
  throttle
} from './lib';
import './App.css'
import { NotesContext, SettingsContext, AudioReactContext } from './context'
import { KeySignature } from './components/keySignature'
import { Keyboard } from './components/keyboard'
import { TutModal } from './components/tutModal'

function App() {
  const {tonality, tonic, setTonic, octaves} = useContext(SettingsContext);
  const {scale, chord} = useContext(NotesContext);
  const {playNotes} = useContext(AudioReactContext);
  const $mainRef = useRef<HTMLElement>(null);

  function keyboardOverflowHandler() {
    if ($mainRef.current) {
      const isOverflowing = $mainRef.current.scrollWidth > $mainRef.current.clientWidth

      $mainRef.current.classList[isOverflowing ? 'add' : 'remove']('overflow');
    }
  }

  useEffect(() => {
    const throttledCb = throttle(keyboardOverflowHandler, 200);
    window.addEventListener('resize', throttledCb);

    return () => window.removeEventListener('resize', throttledCb);
  }, [])

  useEffect(() => {
    keyboardOverflowHandler();
  }, [octaves])


  return (
      <>
        <div className="video-wrapper">
          <video playsInline autoPlay muted loop>
            <source src="output.webm" type="video/webm" />
            <source src="output.mp4" type="video/mp4" />
          </video>
        <div className="shadow"></div>
        </div>
        <TutModal />
        <section className='play-button'>
          <button
            className='play'
            onClick={() => {playNotes((chord || scale) as Sequence)}}
          >►</button>
        </section>
        <section className="key-selector">
          <label htmlFor="key">Key: </label>
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
          <KeySignature />
        </section>
        <main ref={$mainRef}>
          <Keyboard />
        </main>
    </>
  )
}

export default App;
