import { useEffect, useContext } from 'react'
import { NotesContext, SettingsContext } from '../context';
import { TONALITY, getMajorKeyLabel } from '../lib'
import abcjs from 'abcjs';

export function KeySignature() {
  const { tonic, tonality } = useContext(SettingsContext);
  const { chord } = useContext(NotesContext);

  useEffect(() => {
    const key = tonality === TONALITY.MAJOR ?
      getMajorKeyLabel(tonic) : getMajorKeyLabel((tonic + 3) % 12 as Note);
    //let notes = '';

    //if (chord) {
      //notes = `[${chord.labels.join('')}]`;
    //}

    abcjs.renderAbc('paper', `X:1\nK:${key}\n|\n`);

  }, [tonic, chord, tonality]);

  return <div id='paper'></div>
}


