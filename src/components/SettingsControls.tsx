import { useContext } from 'react';
import { SettingsContext } from '../context/settings';
import { TONALITY, Note } from '../lib';
import { Button } from './Button';

export function ShowHideButton() {
  const { showIvoryLabels, setShowIvoryLabels } = useContext(SettingsContext);

  return (
    <Button
      variant="outline"
      onClick={() => {
        setShowIvoryLabels(!showIvoryLabels);
      }}
    >
      {`${showIvoryLabels ? 'hide' : 'show'} labels`}
    </Button>
  );
}

export function OnlyInKeyButton() {
  const { showIvoryLabels, onlyInKey, setOnlyInKey } = useContext(SettingsContext);

  if (!showIvoryLabels) return null;

  return (
    <Button
      variant="outline"
      onClick={() => {
        setOnlyInKey(!onlyInKey);
      }}
    >
      {onlyInKey ? 'all keys' : 'only in scale'}
    </Button>
  );
}

export function OctavesControls() {
  const { octaves, increaseOctaves, decreaseOctaves } = useContext(SettingsContext);

  return (
    <div className="octaves-controls">
      {/* eslint-disable-next-line */}
      <label> number of octaves: {octaves} </label>
      <Button
        size="sm"
        variant="secondary"
        onClick={increaseOctaves}
      >
        +
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={decreaseOctaves}
      >
        -
      </Button>
    </div>
  );
}

export function TonalityControls() {
  const {
    tonality, setTonality, tonic, setTonic,
  } = useContext(SettingsContext);

  return (
    <div className="tonality-controls mb-8">
      <h3 className="mb-2">tonality</h3>
      <div className="flex items-center gap-2 justify-center">
        {Object.entries(TONALITY).map(([t, label]) => (
          <Button
            key={label}
            variant={tonality === label ? 'selected' : 'default'}
            onClick={() => {
              setTonality(TONALITY[t as keyof typeof TONALITY]);
            }}
          >
            {label}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            if (tonality === TONALITY.MAJOR) {
              setTonic(((tonic + 9) % 12) as Note);
              setTonality(TONALITY.MINOR_NATURAL);
            } else {
              setTonality(TONALITY.MAJOR);
              setTonic(((tonic + 3) % 12) as Note);
            }
          }}
        >
          {`go to relative ${tonality === TONALITY.MAJOR ? 'minor' : 'major'}`}
        </Button>
      </div>
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
