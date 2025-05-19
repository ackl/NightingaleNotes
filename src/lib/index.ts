export const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type Note = typeof notes[number];

export enum TONALITY {
  MAJOR = 'Major',
  MINOR_NATURAL = 'Minor Natural',
  MINOR_HARMONIC = 'Minor Harmonic',
  MINOR_MELODIC = 'Minor Melodic (ascending/jazz)',
}

export const accidentals = {
  SHARP: '♯',
  FLAT: '♭',
  NATURAL: '♮',
  DOUBLE_SHARP: '𝄪',
  DOUBLE_FLAT: '𝄫'
} as const

export type AccidentalName = keyof typeof accidentals;
export type AccidentalSymbol = typeof accidentals[AccidentalName];

export const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const satisfies string[];
export type NoteLabelBase = typeof noteLabels[number];
export type NoteLabel = `${NoteLabelBase}${AccidentalSymbol}` | NoteLabelBase

export type Sequence = {
  notes: Note[],
  labels: NoteLabel[]
}

type KeySignatureAccidentalType = Exclude<AccidentalName, 'DOUBLE_FLAT' | 'DOUBLE_SHARP'>

// can also use this as the intervals of a Maj scale
export const whiteKeys: Note[] = [0, 2, 4, 5, 7, 9, 11];

export const SHARP_ORDER: Note[] = [5, 0, 7, 2, 9, 4, 11];  // F, C, G, D, A, E, B
export const FLAT_ORDER: Note[] = [11, 4, 9, 2, 7, 0, 5];   // B, E, A, D, G, C, F

export const INTERVALS = {
  P1: 0, d2: 0,
  m2: 1, A1: 1,
  M2: 2, d3: 2,
  m3: 3, A2: 3,
  M3: 4, d4: 4,
  P4: 5, A3: 5,
  TT: 6, A4: 6, d5: 6,
  P5: 7, d6: 7,
  m6: 8, A5: 8,
  M6: 9, d7: 9,
  m7: 10, A6: 10,
  M7: 11, d8: 11,
  P8: 12, A7: 12
} as const;

export type IntervalSymbol = keyof typeof INTERVALS


export interface KeySignature {
  tonic: Note;
  tonality: TONALITY;
  accidentals: Note[];
  accidentalType: KeySignatureAccidentalType;
  scaleAscending: Sequence;
}

const tonalityIntervals: Record<TONALITY, Note[]> = {
  [TONALITY.MAJOR]: whiteKeys,
  [TONALITY.MINOR_NATURAL]: [0, 2, 3, 5, 7, 8, 10],
  [TONALITY.MINOR_HARMONIC]: [0, 2, 3, 5, 7, 8, 11],
  [TONALITY.MINOR_MELODIC]: [0, 2, 3, 5, 7, 9, 11],
};

export const circleOfFifths: Note[] = Array.from({ length: 12 }, (_, i) => {
  return (i * INTERVALS.P5) % 12 as Note
})

function getBaseLetters(tonicBase: NoteLabelBase): NoteLabelBase[] {
  const startIndex = noteLabels.indexOf(tonicBase);
  return wrapArray([...noteLabels], startIndex);
}

function labelToNote(noteLabel: NoteLabelBase) {
  const idx = noteLabels.indexOf(noteLabel);
  return whiteKeys[idx];
}

function findBaseLetterAndAccidental(note: Note, accidentalType: KeySignatureAccidentalType): { base: NoteLabelBase, accidental: AccidentalSymbol | '' } {
  if (accidentalType === 'FLAT') {
    for (const base of noteLabels) {
      const notePredicate = labelToNote(base);
      if ((notePredicate - 1 + 12) % 12 === note) {
        return { base, accidental: accidentals.FLAT };
      }
    }
  }

  if (accidentalType === 'SHARP') {
    for (const base of noteLabels) {
      const notePredicate = labelToNote(base);
      if ((notePredicate + 1) % 12 === note) {
        return { base, accidental: accidentals.SHARP };
      }
    }
  }

  for (const base of noteLabels) {
    const notePredicate = labelToNote(base);
    if (notePredicate === note) {
      return { base, accidental: '' };
    }
  }

  throw new Error(`Cannot find base letter for note ${note}`);
}

function calculateDifference(actualNote: Note, naturalNote: Note): number {
  let difference = actualNote - naturalNote;
  if (difference > 2) {
    difference = (difference - 12) % 12;
  } else if (difference < -2) {
    difference = (difference + 12) % 12;
  }

  return difference;
}

function getAccidentalSymbol(difference: number, tonality: TONALITY, idx: number): AccidentalSymbol | '' {
  if (difference === 0) {
    if (tonality === TONALITY.MAJOR) {
      return '';
    }

    if (tonalityIntervals[tonality][idx] !== tonalityIntervals[TONALITY.MINOR_NATURAL][idx]) {
      return accidentals.NATURAL;
    }

    return '';
  }

  if (difference === 1) return accidentals.SHARP;
  if (difference === -1) return accidentals.FLAT;
  if (difference === 2) return accidentals.DOUBLE_SHARP;
  if (difference === -2) return accidentals.DOUBLE_FLAT;
  // Handle other cases if necessary
  throw new Error(`Unsupported accidental difference: ${difference}`);
}

export function getKeySignatures(tonic: Note, tonality: TONALITY): KeySignature[] {
  // Adjust tonic for minor tonalities to their relative major
  let adjustedTonic = tonic;
  if (tonality !== TONALITY.MAJOR) {
    adjustedTonic = (tonic + 3) % 12 as Note;
  }

  const index = circleOfFifths.indexOf(adjustedTonic);
  if (index === -1) {
    throw new Error(`Adjusted tonic ${adjustedTonic} not found in circle of fifths.`);
  }

  const keySignatures: KeySignature[] = [];
  const intervals = tonalityIntervals[tonality];
  const scaleNotes = intervals.map(interval => (tonic + interval) % 12 as Note);

  // Handle C major/A minor (no accidentals)
  if (index === 0) {
    keySignatures.push({
      tonic,
      tonality,
      accidentals: [],
      accidentalType: 'NATURAL',
      scaleAscending: {
        notes: scaleNotes,
        labels: noteLabels,
      }
    });
    return keySignatures;
  }


  // Determine possible accidental types (SHARP and/or FLAT)
  const accidentalTypes: ('SHARP' | 'FLAT')[] = [];
  if (index >= 1 && index <= 4) {
    accidentalTypes.push('SHARP');
  } else if (index >= 8 && index <= 11) {
    accidentalTypes.push('FLAT');
  } else {
    accidentalTypes.push('FLAT', 'SHARP');
  }

  // Generate key signatures for each accidental type
  for (const type of accidentalTypes) {
    let accidentalsList: Note[];
    if (type === 'SHARP') {
      accidentalsList = SHARP_ORDER.slice(0, index);
    } else {
      const numFlats = 12 - index;
      accidentalsList = FLAT_ORDER.slice(0, numFlats);
    }

    // Determine original tonic's base letter and accidental
    const tonicInfo = findBaseLetterAndAccidental(tonic, type);
    const baseLetters = getBaseLetters(tonicInfo.base);

    // Calculate labels considering key accidentals and scale alterations
    const labels = scaleNotes.map((note, i) => {
      const baseLetter = baseLetters[i];
      const naturalNote = labelToNote(baseLetter);
      const difference = calculateDifference(note, naturalNote);
      const accidental = getAccidentalSymbol(difference, tonality, i);
      return `${baseLetter}${accidental}`;
    }) as NoteLabel[];

    keySignatures.push({
      tonic,
      tonality,
      accidentals: accidentalsList,
      accidentalType: type,
      scaleAscending: {
        notes: scaleNotes,
        labels,
      }
    });
  }

  keySignatures.sort((a, b) => {
    const predicate = a.accidentals.length - b.accidentals.length
    if (predicate) return predicate;
    // this will prefer flat spelling for Gb/F#
    return a.accidentalType === 'FLAT' ? -1 : 0;
  });

  return keySignatures;
}

// Give flats to all but C and F
const majorKeyLabels = noteLabels.flatMap((prev, i) => {
  return (i !== 0 && i !== 3) ? [prev + 'b', prev] : [prev]
})

// Give sharps to all but E and A and B. give flat to B
const minorKeyLabels = noteLabels.flatMap((prev, i) => {
  if (i === 2 || i === 6) {
    return [prev + 'b', prev];
  }
  if (i === 1 || i === 5) return [prev];

  return [prev, prev + '#']
})

export function getMajorKeyLabel(note: Note) {
  return majorKeyLabels[notes.indexOf(note)]
}

export function getMinorKeyLabel(note: Note) {
  return minorKeyLabels[notes.indexOf(note)]
}

export enum CHORD_TYPE_ENUM {
  MAJOR = 'M',
  MINOR = 'm',
  DIM = 'd',
  AUG = '+',
  SEVENTH_MAJ = 'maj7',
  SEVENTH_DOM = '7',
  SEVENTH_MIN = 'm7',
  SEVENTH_HALF_DIM = 'dm7',
  SEVENTH_FULL_DIM = 'd7'
}

type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

const CHORD_TYPE_LABELS = {
  'd': '°',
  '+': '+',
  'maj7': 'ᴹ⁷',
  '7': '⁷',
  'm7': '⁷',
  'dm7': '𐞢⁷',
  'd7': '°⁷'
} as const;

export type CHORD_TYPE_LABEL_SUFFIX = typeof CHORD_TYPE_LABELS[keyof typeof CHORD_TYPE_LABELS]

const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'] as const satisfies string[];
type LowerRomanNumeral = typeof romanNumerals[number]
type UpperRomanNumeral = Uppercase<LowerRomanNumeral>;
type BaseRomanNumeral = LowerRomanNumeral | UpperRomanNumeral;
type QualityRomanNumeral = `${BaseRomanNumeral}${CHORD_TYPE_LABEL_SUFFIX}`
type RomanNumeral = BaseRomanNumeral | QualityRomanNumeral;

function getTriadRomanNumeralsFromChordTypes(chordTypes: CHORD_TYPE[]): string[] {
  return chordTypes.map((chordType, index) => {
    const baseNumeral = romanNumerals[index];

    // Uppercase for major and augmented
    const numeral = (chordType === 'M' || chordType === '+' || chordType === 'maj7' || chordType === '7')
      ? baseNumeral.toUpperCase()
      : baseNumeral;

    // Add symbols for diminished and augmented
    return numeral + `${CHORD_TYPE_LABELS[chordType] || ''}`;
  });
}

interface ScaleProperties {
  chordTypes: CHORD_TYPE[];
  romanNumerals: string[];
}

const majorScaleChordTypes: CHORD_TYPE[] = ['M', 'm', 'm', 'M', 'M', 'm', 'd'];

const majorScaleProperties: ScaleProperties = {
  chordTypes: majorScaleChordTypes,
  romanNumerals: getTriadRomanNumeralsFromChordTypes(majorScaleChordTypes)
}

const minorNaturalScaleProperties: ScaleProperties = {
  chordTypes: wrapArray(majorScaleChordTypes, 5),
  romanNumerals: getTriadRomanNumeralsFromChordTypes(wrapArray(majorScaleChordTypes, 5))
}

const minorHarmonicScaleProperties: ScaleProperties = {
  chordTypes: ['m', 'd', '+', 'm', 'M', 'M', 'd'],
  romanNumerals: getTriadRomanNumeralsFromChordTypes(['m', 'd', '+', 'm', 'M', 'M', 'd'])
}

const minorMelodicScaleProperties: ScaleProperties = {
  chordTypes: ['m', 'm', '+', 'M', 'M', 'd', 'd'],
  romanNumerals: getTriadRomanNumeralsFromChordTypes(['m', 'm', '+', 'M', 'M', 'd', 'd'])
}

const tonalityUtilsMap: Record<TONALITY, ScaleProperties> = {
  [TONALITY.MAJOR]: majorScaleProperties,
  [TONALITY.MINOR_NATURAL]: minorNaturalScaleProperties,
  [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleProperties,
  [TONALITY.MINOR_MELODIC]: minorMelodicScaleProperties
}

export function getDiatonicChordRomanNumerals(tonality: TONALITY) {
  return tonalityUtilsMap[tonality].romanNumerals;
}

export const CHORD_TYPE_INTERVALS_MAP = {
  [CHORD_TYPE_ENUM.MAJOR]: [0, INTERVALS.M3, INTERVALS.P5],
  [CHORD_TYPE_ENUM.MINOR]: [0, INTERVALS.m3, INTERVALS.P5],
  [CHORD_TYPE_ENUM.DIM]: [0, INTERVALS.m3, INTERVALS.d5],
  [CHORD_TYPE_ENUM.AUG]: [0, INTERVALS.M3, INTERVALS.A5],
  [CHORD_TYPE_ENUM.SEVENTH_MAJ]: [0, INTERVALS.M3, INTERVALS.A5]
}

export function buildChord(root: Note, chordType: CHORD_TYPE) {
  const intervals = CHORD_TYPE_INTERVALS_MAP[chordType]

  return intervals.map(i => getNoteFromInterval(root, i))
}

export function buildDiatonicTriads(keySignature: KeySignature): Sequence[] {
  const scale = keySignature.scaleAscending;
  return scale.notes.map((root, i) => {
    const chordType = tonalityUtilsMap[keySignature.tonality].chordTypes[i]
    const triad = buildChord(root as Note, chordType)

    return {
      labels: [],
      notes: triad
    }
  });
}

export const diatonicDegreeNames = [
  'Tonic', 'Supertonic', 'Mediant', 'Subdominant',
  'Dominant', 'Submediant', 'Leading tone', 'Tonic'
]

export function getNoteFromInterval(lower: Note, interval: number) {
  return ((lower + interval) % 12) as Note
}

function wrapArray(arr: Array<any>, startIndex: number) {
  // Ensure startIndex is within the valid range
  startIndex = (startIndex % arr.length + arr.length) % arr.length;

  // Use slice to create two parts of the array and rearrange them
  const part1 = arr.slice(startIndex);
  const part2 = arr.slice(0, startIndex);

  // Concatenate the two parts to get the wrapped array
  const wrappedArray = part1.concat(part2);

  return wrappedArray;
}

export function throttle(mainFunction: (...args: any[]) => any, delay: number) {
  let timerFlag: number | null = null; // Variable to keep track of the timer

  // Returning a throttled version
  return (...args: any[]) => {
    if (timerFlag === null) { // If there is no timer currently running
      mainFunction(...args); // Execute the main function
      timerFlag = setTimeout(() => { // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
      }, delay);
    }
  };
}
