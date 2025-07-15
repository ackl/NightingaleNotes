import { useContext } from 'react';
import { NotesContext } from '../context/notes';
import { SettingsContext } from '../context/settings';
import {
  diatonicDegreeNames,
  getDiatonicChordRomanNumerals,
  Note,
} from '../lib';

export function DiatonicChords() {
  const { diatonicChordRoot, setDiatonicChordRoot } = useContext(NotesContext);
  const { tonality } = useContext(SettingsContext);

  return (
    <>
      <div className="diatonic-chords">
        <h3>diatonic triads</h3>
        {getDiatonicChordRomanNumerals(tonality).map((label, i) => (
          <button
            type="button"
            key={label}
            onClick={() => {
              // set i as degree of scale for root of diatonic chords
              if (diatonicChordRoot === i) {
                setDiatonicChordRoot(undefined);
              } else {
                setDiatonicChordRoot(i as Note);
              }
            }}
            className={diatonicChordRoot === i ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="degree-name">
        {diatonicChordRoot !== undefined
          && diatonicDegreeNames[diatonicChordRoot]}
      </p>
    </>
  );
}
