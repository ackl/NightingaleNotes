import { useContext } from 'react'
import { NotesContext, SettingsContext } from '../context'
import {
  whiteKeys,
  getNoteLabel
} from '../lib';

export function Ivory({
  note,
  isFirstOctave,
  isLastOctave,
}: {
  note: Note,
  isFirstOctave: boolean,
  isLastOctave: boolean,
}) {
  const isWhiteKey = whiteKeys.includes(note);
  const {tonic, setTonic, showIvoryLabels, onlyInKey, tonality} = useContext(SettingsContext);
  const {scale, chord} = useContext(NotesContext);

  const noteLabel = getNoteLabel(tonic, note, tonality);

  let isNoteInScale = scale?.scaleNotes.includes(note);
  let isHighlight = true;

  if (chord) {
    isHighlight = chord.notes.includes(note);
    if (isFirstOctave && (note < chord.notes[0])) isHighlight = false;
    if (isLastOctave && (note > chord.notes[0])) isHighlight = false;
  } else {
    isHighlight = scale?.scaleNotes.includes(note) || false;
    if (isFirstOctave && (note < tonic)) isHighlight = false;
    if (isLastOctave && (note > tonic)) isHighlight = false;
  }


  return (
    <div
      className={
        `
        ivory
        ivory--${note}
        ${isWhiteKey ? 'white' : 'black'}
        ${isHighlight ? ' in-scale' : ''}
        ${chord ? ' chord' : ''}
        ${tonic === note ? 'ivory--tonic' : ''}
        `
      }
      onClick={() => {
        setTonic(note);
      }}
    >
      <span className={`ivory-label ${showIvoryLabels && 'show'}`}>
        {onlyInKey ? isNoteInScale && noteLabel : noteLabel}
      </span>
    </div>
  )
}
