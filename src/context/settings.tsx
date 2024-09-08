import type { ReactNode } from 'react'
import { useState, createContext } from 'react'
import { TONALITY, } from '../lib';

interface Settings {
  showIvoryLabels: boolean;
  onlyInKey: boolean;
  octaves: number;
  tonality: TONALITY
  setTonality: (arg: TONALITY) => void;
  tonic: Note;
  setTonic: (arg: Note) => void;
}

const initialSettingsState: Settings = {
  showIvoryLabels: false,
  onlyInKey: true,
  octaves: 2,
  tonality: TONALITY['MAJOR'],
  setTonality: () => {},
  tonic: 0,
  setTonic: () => {},
}

export const SettingsContext = createContext<Settings>(initialSettingsState);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [showIvoryLabels, setShowIvoryLabels] = useState(initialSettingsState.showIvoryLabels);
  const [onlyInKey, setOnlyInKey] = useState(initialSettingsState.onlyInKey);
  const [octaves, setOctaves] = useState(initialSettingsState.octaves);
  const [tonality, setTonality] = useState<TONALITY>(initialSettingsState.tonality);
  const [tonic, setTonic] = useState<Note>(0);

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
      <label>number of octaves: {octaves}  </label>
      <button onClick={() => setOctaves((prev) => prev > 3 ? 4 : prev + 1)}>+</button>
      <button onClick={() => setOctaves((prev) => prev < 3 ? 2 : prev - 1)}>-</button>
    </div>
  }

  return (
    <SettingsContext.Provider value={{
        showIvoryLabels,
        onlyInKey,
        octaves,
        tonality,
        setTonality,
        tonic,
        setTonic,
    }}>
      {children}
      <div className='settings-controls'>
        <ShowHideButton />
        <OnlyInKey />
      </div>
      <div className='octaves-controls'>
        <OctavesButtons />
      </div>
      <div className='tonality-controls'>
        <h3>tonality</h3>
        {Object.entries(TONALITY).map(([t, label]) => {
          return (
            <button
              key={label}
              className={`${tonality === label ? 'active' : ''}`}
              onClick={() => {
                setTonality(TONALITY[t as keyof typeof TONALITY])
            }}>{label}</button>
          )
        })}
        <button
          onClick={() => {
            if (tonality === TONALITY.MAJOR) {
              setTonic((tonic + 9) % 12 as Note);
              setTonality(TONALITY.MINOR_NATURAL);
            } else {
              setTonality(TONALITY.MAJOR);
              setTonic((tonic + 3) % 12 as Note);
            }
          }}
        >go to relative {tonality === TONALITY.MAJOR ? 'minor' : 'major'}</button>
      </div>
    </SettingsContext.Provider>
  );
};
