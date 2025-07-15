import { memo, useContext, useMemo } from 'react';
import { useHaptic } from 'use-haptic';
import { NotesContext, SettingsContext, AudioReactContext } from '../context';
import { whiteKeys } from '../lib';
import type { Note } from '../lib';

export const Ivory = memo(
  ({ note, octave }: { note: Note; octave: number }) => {
    const isWhiteKey = useMemo(() => whiteKeys.includes(note), [note]);
    const {
      tonic, showIvoryLabels, onlyInKey, octaves,
    } = useContext(SettingsContext);
    const {
      chord,
      keySignature: { scaleAscending: scale },
    } = useContext(NotesContext);
    const { playTone } = useContext(AudioReactContext);
    const { triggerHaptic } = useHaptic();

    const isFirstOctave = octave === 0;
    const isLastOctave = octave === octaves - 1;

    function getNoteLabelFromScale() {
      const idx = scale.notes.indexOf(note);
      if (idx > -1) {
        return scale.labels[idx];
      }

      console.log('will render BLANK on the key', note, idx);
      return null;
    }

    const isNoteInScale = scale.notes.includes(note);
    let noteLabel = isNoteInScale ? getNoteLabelFromScale() : 'TODO';

    if (note === 0 && (noteLabel === 'TODO' || !noteLabel)) {
      console.log('inside the if statement', scale);
      noteLabel = scale.labels[11];
    }

    let isHighlight = true;
    console.log('rendering key for ', note, noteLabel, scale.notes);

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
        role="presentation"
        className={`
        ivory
        ivory--${octave ? octave * 12 + note : note}
        ${isWhiteKey ? 'white' : 'black'}
        ${isHighlight ? ' in-scale' : ''}
        ${tonic === note ? 'ivory--tonic' : ''}
        `}
        onClick={async (e) => {
          e.stopPropagation();
          triggerHaptic();
          await playTone(note + octave * 12);
        }}
        onTouchStart={(e) => {
          // iOS Safari sometimes needs touchstart to be explicitly handled
          e.stopPropagation();
        }}
      >
        <span className={`ivory-label ${showIvoryLabels && 'show'}`}>
          {onlyInKey ? isNoteInScale && noteLabel : noteLabel}
        </span>
      </div>
    );
  },
);
