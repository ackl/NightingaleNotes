import { ReactElement, useContext } from 'react';
import { SettingsContext } from '../context';
import { Octave } from './octave';

export function Keyboard() {
  const { octaves, octaveForMusicalKeyboard } = useContext(SettingsContext);

  const els: ReactElement[] = [];
  for (let i = 0; i < octaves; i++) {
    els.push(<Octave key={i} octave={i} />);
  }

  return (
    <div className="keyboard-wrapper">
      <section className="keyboard perspective-shift">
        {els.map((el) => el)}
      </section>
      <p>keyboard {octaveForMusicalKeyboard}</p>
    </div>
  );
}
