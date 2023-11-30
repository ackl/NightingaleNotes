import { useContext, useEffect, useRef } from 'react'
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

function throttle(mainFunction: (...args: any[]) => any, delay: number) {
  let timerFlag: number | null = null; // Variable to keep track of the timer

  // Returning a throttled version 
  return (...args: any[]) => {
    if (timerFlag === null) { // If there is no timer currently running
      mainFunction(...args); // Execute the main function 
      timerFlag = setTimeout(() => { // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
      }, delay);
    }
  };
}


function App() {
  const {tonality, tonic, setTonic, octaves} = useContext(SettingsContext);
  const {scale, chord} = useContext(NotesContext);
  const {audioContext, playSequence, playChord} = useContext(AudioReactContext);
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
        <section className='play-button'>
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
                  chord ? playChord(sequenceNotes) : playSequence(sequenceNotes);
                }
              }
            }}
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
