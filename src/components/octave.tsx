import { Ivory } from './ivory';
import {
  notes,
} from '../lib';

export function Octave(props: {
  isFirstOctave: boolean,
  isLastOctave: boolean
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

