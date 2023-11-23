export const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export const enharmonicLabels = [ 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B' ];
export const majorKeyLabels = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];

export const whiteKeys =  [0, 2, 4, 5, 7, 9, 11];

export const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export type Note = typeof notes[number];

export enum accidental {
  SHARP = '♯',
  FLAT = '♭'
}

export function getEnharmonicLabel(note: Note) {
  return enharmonicLabels[notes.indexOf(note)]
}

export function getMajorKeyLabel(note: Note) {
  return majorKeyLabels[notes.indexOf(note)]
}

export function getNoteLabel(tonic: Note, note: Note) {
  if (whiteKeys.includes(note)) {
    return noteLabels[whiteKeys.indexOf(note)];
  }

  // Use flat in key sig if tonic is F
  if (whiteKeys.includes(tonic) && tonic !== 5) {
    return sharpen(note);
  }

  return flatten(note);
}

export function sharpen(note: Note) {
  const idx = whiteKeys.indexOf(note - 1);
  return `${noteLabels[idx]}${accidental['SHARP']}`
}
export function flatten(note: Note) {
  const idx = whiteKeys.indexOf(note + 1);
  return `${noteLabels[idx]}${accidental['FLAT']}`
}

export function getMajorScaleNotes(tonic: Note) {
  const intervals = [0, 2, 4, 5, 7, 9, 11];

  return intervals.map(interval => getNoteFromInterval(tonic, interval))
}

export function getMajorScale(tonic: Note) {
  const scaleNotes = getMajorScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n));

  return {
    scaleNotes,
    scaleLabels
  }
}

export function getNoteFromInterval(tonic: Note, interval: number) {
  return ((tonic + interval) % 12) as Note
}
