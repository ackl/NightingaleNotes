import { memo, useContext, useMemo } from 'react';
import { useHaptic } from 'use-haptic';
import { NotesContext, SettingsContext, AudioReactContext } from '../context';
import { naturalNotes } from '../lib';
import type { NaturalNote, Note } from '../lib';

export const Ivory = memo(
  ({ note, octave }: { note: Note; octave: number }) => {
    const isWhiteKey = useMemo(() => naturalNotes.includes(note as NaturalNote), [note]);
    const {
      tonic, showIvoryLabels, onlyInKey, octaves,
    } = useContext(SettingsContext);
    const {
      chord,
      keySignature: { scaleAscending: scale },
    } = useContext(NotesContext);
    const { audioContextManager } = useContext(AudioReactContext);
    const { triggerHaptic } = useHaptic();

    const isFirstOctave = octave === 0;
    const isLastOctave = octave === octaves - 1;

    function getNoteLabelFromScale() {
      const idx = scale.notes.indexOf(note);
      if (idx > -1) {
        return scale.labels[idx];
      }

      return null;
    }

    const isNoteInScale = scale.notes.includes(note);
    const noteLabel = isNoteInScale ? getNoteLabelFromScale() : 'TODO';

    // if (note === 0 && (noteLabel === 'TODO' || !noteLabel)) {
    //   noteLabel = scale.labels[scale.labels.length - 1];
    // }

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
          await audioContextManager?.playTone(note + octave * 12);
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
