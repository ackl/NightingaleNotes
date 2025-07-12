import { memo, useContext, useMemo } from "react";
import { NotesContext, SettingsContext, AudioReactContext } from "../context";
import { whiteKeys } from "../lib";
import type { Note } from "../lib";
import { useHaptic } from "use-haptic";

export const Ivory = memo(function Ivory({ note, octave }: { note: Note; octave: number }) {
  const isWhiteKey = useMemo(() => whiteKeys.includes(note), [note]);
  const { tonic, showIvoryLabels, onlyInKey, octaves } = useContext(SettingsContext);
  const { chord, keySignature: { scaleAscending: scale } } = useContext(NotesContext);
  const { playTone } = useContext(AudioReactContext);
  const { triggerHaptic } = useHaptic();

  const isFirstOctave = octave === 0;
  const isLastOctave = octave === octaves - 1;

  function getNoteLabelFromScale() {
    const idx = scale.notes.indexOf(note);
    if (idx > -1) {
      return scale.labels[idx]
    }
  }

  const isNoteInScale = scale.notes.includes(note);
  const noteLabel = isNoteInScale ? getNoteLabelFromScale() : 'TODO';
  let isHighlight = true;

  if (chord) {
    isHighlight = chord.notes.includes(note);
    if (isFirstOctave && note < chord.notes[0]) isHighlight = false;
    if (isLastOctave && note > chord.notes[0]) isHighlight = false;
  } else {
    isHighlight = scale.notes.includes(note) || false;
    if (isFirstOctave && note < tonic) isHighlight = false;
    if (isLastOctave && note > tonic) isHighlight = false;
  }

  return (
    <div
      className={`
        ivory
        ivory--${octave ? (octave * 12) + note : note}
        ${isWhiteKey ? "white" : "black"}
        ${isHighlight ? " in-scale" : ""}
        ${tonic === note ? "ivory--tonic" : ""}
        `}
      onClick={() => {
        // Haptic feedback for mobile devices including iOS Safari
        triggerHaptic();
        playTone(note + octave * 12);
      }}
    >
      <span className={`ivory-label ${showIvoryLabels && "show"}`}>
        {onlyInKey ? isNoteInScale && noteLabel : noteLabel}
      </span>
    </div>
  );
});
