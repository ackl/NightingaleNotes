import { useContext } from "react";
import { NotesContext, SettingsContext, AudioReactContext } from "../context";
import { whiteKeys, getNoteLabel } from "../lib";

export function Ivory({ note, octave }: { note: Note; octave: number }) {
  const isWhiteKey = whiteKeys.includes(note);
  const { tonic, showIvoryLabels, onlyInKey, tonality, octaves } = useContext(
    SettingsContext
  );
  const { scale, chord } = useContext(NotesContext);
  const { playTone } = useContext(AudioReactContext);

  const noteLabel = getNoteLabel(tonic, note, tonality);
  const isFirstOctave = octave === 0;
  const isLastOctave = octave === octaves - 1;

  let isNoteInScale = scale?.notes.includes(note);
  let isHighlight = true;

  if (chord) {
    isHighlight = chord.notes.includes(note);
    if (isFirstOctave && note < chord.notes[0]) isHighlight = false;
    if (isLastOctave && note > chord.notes[0]) isHighlight = false;
  } else {
    isHighlight = scale?.notes.includes(note) || false;
    if (isFirstOctave && note < tonic) isHighlight = false;
    if (isLastOctave && note > tonic) isHighlight = false;
  }

  return (
    <div
      className={`
        ivory
        ivory--${octave ? octave + 11 + note : note}
        ${isWhiteKey ? "white" : "black"}
        ${isHighlight ? " in-scale" : ""}
        ${chord ? " chord" : ""}
        ${tonic === note ? "ivory--tonic" : ""}
        `}
      onClick={(ev) => {
        //setTonic(note);
        playTone(note + octave * 12);
        //const $el = ev.target as HTMLElement;
        //$el.classList.add("flash");
        //setTimeout(() => $el.classList.remove("flash"), 300);
      }}
    >
      <span className={`ivory-label ${showIvoryLabels && "show"}`}>
        {onlyInKey ? isNoteInScale && noteLabel : noteLabel}
      </span>
    </div>
  );
}
