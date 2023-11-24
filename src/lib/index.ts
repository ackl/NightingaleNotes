export const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export const enharmonicLabels = [ 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B' ];
export const majorKeyLabels = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];

export enum INTERVALS {
  THIRD_MINOR = 3,
  THIRD_MAJOR = 4,
  FOURTH_PERFECT = 5,
  TRITONE = 6,
  FIFTH_PERFECT = 7
}

export enum CHORD_TYPE_ENUM {
  MAJOR = 'M',
  MINOR = 'm',
  DIM = 'd'
}

type CHORD_TYPE =`${CHORD_TYPE_ENUM}`;

export const CHORD_TYPE_INTERVALS_MAP = {
  [CHORD_TYPE_ENUM.MAJOR]: [0, INTERVALS.THIRD_MAJOR, INTERVALS.FIFTH_PERFECT],
  [CHORD_TYPE_ENUM.MINOR]: [0, INTERVALS.THIRD_MINOR, INTERVALS.FIFTH_PERFECT],
  [CHORD_TYPE_ENUM.DIM]: [0, INTERVALS.THIRD_MINOR, INTERVALS.TRITONE]
}

export function buildChord(root: Note, chordType: CHORD_TYPE) {
  const intervals = CHORD_TYPE_INTERVALS_MAP[chordType]

  return intervals.map(i => getNoteFromInterval(root, i))
}

export function buildDiatonicTriads(scale: ScaleNotes) {
  return scale.map((root, i) => {
    const chordType = diatonicChordTypes[i];
    return buildChord(root as Note, chordType)
  });
}

export const diatonicDegreeNames = [
'Tonic',
'Supertonic',
'Mediant',
'Subdominant',
'Dominant',
'Submediant',
'Leading tone',
'Tonic',
]
export const diatonicChordRomanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export const diatonicChordTypes: CHORD_TYPE[] = ['M', 'm', 'm', 'M', 'M', 'm', 'd']

// can also use this as the intervals of a Maj scale
export const whiteKeys =  [0, 2, 4, 5, 7, 9, 11];

export const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

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
  return whiteKeys.map(interval => getNoteFromInterval(tonic, interval))
}

export function getMajorScale(tonic: Note) {
  const scaleNotes = getMajorScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n));

  return {
    scaleNotes,
    scaleLabels
  }
}

export function getNoteFromInterval(lower: Note, interval: number) {
  return ((lower + interval) % 12) as Note
}
