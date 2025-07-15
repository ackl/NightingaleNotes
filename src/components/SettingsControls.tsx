import { useContext } from 'react';
import { SettingsContext } from '../context/settings';
import { TONALITY } from '../lib';

export function ShowHideButton() {
  const { showIvoryLabels, setShowIvoryLabels } = useContext(SettingsContext);

  return (
    <button
      type="button"
      onClick={() => {
        setShowIvoryLabels(!showIvoryLabels);
      }}
    >
      {`${showIvoryLabels ? 'hide' : 'show'} labels on keys`}
    </button>
  );
}

export function OnlyInKeyButton() {
  const { showIvoryLabels, onlyInKey, setOnlyInKey } = useContext(SettingsContext);

  if (!showIvoryLabels) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setOnlyInKey(!onlyInKey);
      }}
    >
      {onlyInKey ? 'all keys' : 'only in scale'}
    </button>
  );
}

export function OctavesControls() {
  const { octaves, increaseOctaves, decreaseOctaves } = useContext(SettingsContext);

  return (
    <div className="octaves-controls">
      {/* eslint-disable-next-line */}
      <label> number of octaves: {octaves} </label>
      <button type="button" onClick={increaseOctaves}>+</button>
      <button type="button" onClick={decreaseOctaves}>-</button>
    </div>
  );
}

export function TonalityControls() {
  const {
    tonality, setTonality, tonic, setTonic,
  } = useContext(SettingsContext);

  return (
    <div className="tonality-controls">
      <h3>tonality</h3>
      {Object.entries(TONALITY).map(([t, label]) => (
        <button
          type="button"
          key={label}
          className={tonality === label ? 'active' : ''}
          onClick={() => {
            setTonality(TONALITY[t as keyof typeof TONALITY]);
          }}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          if (tonality === TONALITY.MAJOR) {
            setTonic(((tonic + 9) % 12) as any);
            setTonality(TONALITY.MINOR_NATURAL);
          } else {
            setTonality(TONALITY.MAJOR);
            setTonic(((tonic + 3) % 12) as any);
          }
        }}
      >
        go to relative {tonality === TONALITY.MAJOR ? 'minor' : 'major'}
      </button>
    </div>
  );
}

export function SettingsControls() {
  return (
    <div className="settings-controls">
      <ShowHideButton />
      <OnlyInKeyButton />
    </div>
  );
}
