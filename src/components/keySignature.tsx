import { useEffect, useContext } from 'react'
import { SettingsContext, NotesContext } from '../context';
import { Note, TONALITY, getMajorKeyLabel } from '../lib'
import abcjs from 'abcjs';

export function KeySignature() {
  const { tonic, tonality } = useContext(SettingsContext);
  const { keySignature } = useContext(NotesContext);

  useEffect(() => {
    let key = `${keySignature.scaleAscending.labels[0]}${keySignature.tonality === TONALITY.MAJOR ? '' : 'm'}`;
    key = key.replace('♭', 'b');
    key = key.replace('♯', '#');
    console.log('trying to render key: ', key);
    //let notes = '';

    //if (chord) {
      //notes = `[${chord.labels.join('')}]`;
    //}

    abcjs.renderAbc('paper', `X:1\nK:${key}\n|\n`);

  }, [keySignature]);

  return <div id='paper'></div>
}


