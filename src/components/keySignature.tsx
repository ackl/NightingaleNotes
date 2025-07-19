import { useEffect, useContext } from 'react';
import abcjs from 'abcjs';
import { NotesContext } from '../context';
import { TONALITY } from '../lib';

export function KeySignature() {
  const { keySignature } = useContext(NotesContext);

  useEffect(() => {
    // eslint-disable-next-line
    let key = `${keySignature.scaleAscending.labels[0]}${keySignature.tonality === TONALITY.MAJOR ? '' : 'm'}`;

    // Replace unicode accidental symbol with b and # for compatibility with abcjs
    key = key.replace('♭', 'b');
    key = key.replace('♯', '#');

    abcjs.renderAbc('paper', `X:1\nK:${key}\n|\n`);
  }, [keySignature]);

  return <div id="paper" />;
}
