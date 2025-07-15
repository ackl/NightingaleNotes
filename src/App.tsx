import { useContext, useEffect, useRef } from 'react';
import {
  getMajorKeyLabel,
  getMinorKeyLabel,
  Note,
  notes,
  throttle,
  TONALITY,
} from './lib';
import './App.css';
import { AudioReactContext, NotesContext, SettingsContext } from './context';
import { KeySignature } from './components/keySignature';
import { Keyboard } from './components/keyboard';
import { TutModal } from './components/tutModal';
import {
  OctavesControls,
  SettingsControls,
  TonalityControls,
} from './components/SettingsControls';
import { DiatonicChords } from './components/DiatonicChords';

function App() {
  const {
    tonality,
    tonic,
    setTonic,
    octaves,
  } = useContext(SettingsContext);
  const { keySignatures, keySignature, setChosenKeySigIdx } = useContext(
    NotesContext,
  );
  const { playNotes } = useContext(AudioReactContext);
  const $mainRef = useRef<HTMLElement>(null);

  function keyboardOverflowHandler() {
    if ($mainRef.current) {
      const isOverflowing = $mainRef.current.scrollWidth > $mainRef.current.clientWidth;

      $mainRef.current.classList[isOverflowing ? 'add' : 'remove']('overflow');
    }
  }

  useEffect(() => {
    const throttledCb = throttle(keyboardOverflowHandler, 200);
    window.addEventListener('resize', throttledCb);

    return () => window.removeEventListener('resize', throttledCb);
  }, []);

  useEffect(() => {
    keyboardOverflowHandler();
  }, [octaves]);

  return (
    <>
      <div className="video-wrapper">
        <video playsInline autoPlay muted loop>
          <source src="output.webm" type="video/webm" />
          <source src="output.mp4" type="video/mp4" />
        </video>
        <div className="shadow" />
      </div>
      <TutModal />
      <section className="play-button">
        <button
          type="button"
          className="play"
          onClick={() => playNotes(keySignature.scaleAscending)}
        >
          ►
        </button>
      </section>
      <section className="key-selector">
        <label htmlFor="key">Key:
          <select
            id="key"
            onChange={(ev) => {
              setTonic(Number(ev.target.value) as Note);
            }}
            value={tonic}
          >
            {notes.map((n) => (
              <option value={n} key={n}>
                {tonality === TONALITY.MAJOR
                  ? getMajorKeyLabel(n)
                  : getMinorKeyLabel(n)}
              </option>
            ))}
          </select>
        </label>

        <KeySignature />
      </section>
      <section className="enharmonic-key-selector">
        {keySignatures.length > 1
          ? keySignatures.map((kS, i) => (
            <button
              type="button"
              /* eslint-disable-next-line */
              key={`${kS.tonic}-${i}`}
              onClick={() => {
                setChosenKeySigIdx(i);
              }}
            >
              {kS.scaleAscending.labels[0]}
            </button>
          ))
          : null}
      </section>
      <div className="orientation-hint">
        <p>
          🔄 For the best piano experience, try rotating your device to
          landscape mode
        </p>
      </div>
      <main ref={$mainRef}>
        <Keyboard />
      </main>
      <SettingsControls />
      <OctavesControls />
      <TonalityControls />
      <DiatonicChords />
    </>
  );
}

export default App;
