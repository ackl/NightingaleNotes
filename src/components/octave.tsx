import { Ivory } from './ivory';
import {
  notes,
} from '../lib';

export function Octave(props: {
  octave: number,
}) {
  return (
    <>
      {
        notes.map(note => (
          <Ivory
            {...props}
            note={note}
            key={note}
          />
        ))
      }
    </>
  )
}

