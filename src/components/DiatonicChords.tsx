import { useContext } from 'react';
import { NotesContext } from '../context/notes';
import { SettingsContext } from '../context/settings';
import {
  diatonicDegreeNames,
  tonalityDiatonicChordsMap,
  Note,
} from '../lib';
import { Button } from './Button';

export function DiatonicChords() {
  const { diatonicChordRoot, setDiatonicChordRoot } = useContext(NotesContext);
  const { tonality } = useContext(SettingsContext);
  const { romanNumerals } = tonalityDiatonicChordsMap[tonality];

  return (
    <>
      <div className="diatonic-chords">
        <h3 className="mb-2">diatonic triads</h3>
        <div className="flex items-center gap-2 justify-center">
          {romanNumerals.map((label, i) => (
            <Button
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
              variant={diatonicChordRoot === i ? 'selected' : 'default'}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <p className="degree-name">
        {diatonicChordRoot !== undefined
          && diatonicDegreeNames[diatonicChordRoot]}
      </p>
    </>
  );
}
