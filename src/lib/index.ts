import {
  getNoteFromInterval, Note, NoteLabel, Sequence,
} from './core/primitives';
import { TONALITY } from './core/scales';

// Re-export all modules for backward compatibility
import { noteLabels } from './core/primitives';
import { CHORD_TYPE_ENUM } from './core/chords';

export * from './core/primitives';
export * from './core/scales';
export * from './core/chords';
export * from './key-signatures/calculator';
export * from './key-signatures/labeling';
export * from './key-signatures/analysis';
export * from './theory/roman-numerals';
export * from './utils/array-utils';
export * from './utils/throttle';
export * from './utils/memoize';

// can also use this as the intervals of a Maj scale
export const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
export const blackKeys = [1, 3, 6, 8, 10];

export enum accidental {
  SHARP = '♯',
  FLAT = '♭',
  NATURAL = '♮',
  DOUBLE_SHARP = '𝄪',
}

function wrapArray(arr: any[], startIndex: number) {
  // Ensure startIndex is within the valid range
  // eslint-disable-next-line
  startIndex = ((startIndex % arr.length) + arr.length) % arr.length;

  // Use slice to create two parts of the array and rearrange them
  const part1 = arr.slice(startIndex);
  const part2 = arr.slice(0, startIndex);

  // Concatenate the two parts to get the wrapped array
  const wrappedArray = part1.concat(part2);

  return wrappedArray;
}

export function sharpen(note: Note) {
  const idx = whiteKeys.indexOf(note - 1);
  return `${noteLabels[idx]}${accidental.SHARP}`;
}
export function flatten(note: Note) {
  const idx = whiteKeys.indexOf(note + 1);
  return `${noteLabels[idx]}${accidental.FLAT}`;
}
export function natural(note: Note) {
  const idx = whiteKeys.indexOf(note);
  return `${noteLabels[idx]}${accidental.NATURAL}`;
}
export function doubleSharp(note: Note) {
  const idx = whiteKeys.indexOf(note);
  return `${noteLabels[idx]}${accidental.DOUBLE_SHARP}`;
}

export const majorScaleDiatonicChordRomanNumerals = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°',
];
export const minorNaturalScaleDiatonicChordRomanNumerals = [
  'i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII',
];
export const minorHarmonicScaleDiatonicChordRomanNumerals = [
  'i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°',
];
export const minorMelodicScaleDiatonicChordRomanNumerals = [
  'i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°',
];

const majorScaleDiatonicChordTypes: CHORD_TYPE[] = ['M', 'm', 'm', 'M', 'M', 'm', 'd'];
const minorNaturalScaleDiatonicChordTypes: CHORD_TYPE[] = wrapArray(majorScaleDiatonicChordTypes, 5);
const minorHarmonicScaleDiatonicChordTypes: CHORD_TYPE[] = [
  'm', 'd', '+', 'm', 'M', 'M', 'd',
];
const minorMelodicScaleDiatonicChordTypes: CHORD_TYPE[] = [
  'm', 'm', '+', 'M', 'M', 'd', 'd',
];

const tonalityUtilsMap = {
  triads: {
    [TONALITY.MAJOR]: majorScaleDiatonicChordTypes,
    [TONALITY.MINOR_NATURAL]: minorNaturalScaleDiatonicChordTypes,
    [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleDiatonicChordTypes,
    [TONALITY.MINOR_MELODIC]: minorMelodicScaleDiatonicChordTypes,
  },
  triadsRomanNumerals: {
    [TONALITY.MAJOR]: majorScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_NATURAL]: minorNaturalScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_MELODIC]: minorMelodicScaleDiatonicChordRomanNumerals,
  },
  scaleFunction: {
    [TONALITY.MAJOR]: getMajorScale,
    [TONALITY.MINOR_NATURAL]: getMinorNaturalScale,
    [TONALITY.MINOR_HARMONIC]: getMinorHarmonicScale,
    [TONALITY.MINOR_MELODIC]: getMinorMelodicScale,
  },
};

export function getDiatonicChordRomanNumerals(tonality: TONALITY) {
  return tonalityUtilsMap.triadsRomanNumerals[tonality];
}

type CHORD_TYPE = `${CHORD_TYPE_ENUM}`;

export function getNoteLabel(tonic: Note, note: Note, tonality: TONALITY) {
  if (tonality === TONALITY.MINOR_MELODIC) {
    // since default return is to flatten label, use sharpened enharmonic for
    // 7th degree for some cases to maintain diatonic scale spelling. i.e:
    // C into B# if tonic is C#
    // Db into C# if tonic is D
    // F into E# if tonic is F#
    // Gb into F# if tonic is G
    if ([1, 2, 6, 7].includes(tonic) && note === (tonic - 1)) {
      return sharpen(note || (12 as Note));
    }

    // make E into E# if tonic is G#
    // make G into Fx if tonic is G#
    if (tonic === 8) {
      if (note === 5) {
        return sharpen(5);
      }
      if (note === 7) {
        return doubleSharp(note - 2 as Note);
      }
    }

    // make Gb into F# if tonic is A
    // make Ab into G# if tonic is A
    if (tonic === 9) {
      if (note === 6) {
        return sharpen(6);
      }
      if (note === 8) {
        return sharpen(8);
      }
    }

    if (whiteKeys.includes(note)) {
      return noteLabels[whiteKeys.indexOf(note)];
    }

    // e b f# c# g# use sharps
    if ([1, 4, 6, 8, 11].includes(tonic)) {
      return sharpen(note);
    }

    // d eb g c f bb
    return flatten(note);
  } if (tonality === TONALITY.MINOR_NATURAL) {
    // make B into Cb if tonic is Eb
    if (tonic === 3 && note === 11) {
      return flatten(-1 as Note);
    }

    if (whiteKeys.includes(note)) {
      return noteLabels[whiteKeys.indexOf(note)];
    }

    // e b f# c# g# use sharps
    if ([1, 4, 6, 8, 11].includes(tonic)) {
      return sharpen(note);
    }

    // d eb g c f bb
    return flatten(note);
  } if (tonality === TONALITY.MINOR_HARMONIC) {
    // make F into E# if tonic is F#
    if (tonic === 6 && note === 5) {
      return sharpen(5);
    }

    // if we're on the 7th degree, sharpen
    if ((note + 1) % 12 === tonic) {
      // if g# minor, double sharp the 7th
      if (tonic === 8) {
        return doubleSharp(note - 2 as Note);
      }

      if (whiteKeys.includes(note)) {
        return natural(note);
      }

      return sharpen(note);
    }

    // make B into Cb if tonic is Eb
    if (tonic === 3 && note === 11) {
      return flatten(-1 as Note);
    }

    if (whiteKeys.includes(note)) {
      return noteLabels[whiteKeys.indexOf(note)];
    }

    // e b f# c# g# use sharps
    if ([1, 4, 6, 8, 11].includes(tonic)) {
      return sharpen(note);
    }

    // d eb g c f bb
    return flatten(note);
  }

  // major
  // make B into Cb if tonic is Gb
  if (tonic === 6 && note === 11) {
    return flatten(-1 as Note);
  }

  if (whiteKeys.includes(note)) {
    return noteLabels[whiteKeys.indexOf(note)];
  }

  // Use flat in key sig if tonic is F
  if (whiteKeys.includes(tonic) && tonic !== 5) {
    return sharpen(note);
  }

  return flatten(note);
}

export function getMajorScaleNotes(tonic: Note) {
  return whiteKeys.map((interval) => getNoteFromInterval(tonic, interval));
}

export function getMajorScale(tonic: Note): Sequence {
  const scaleNotes = getMajorScaleNotes(tonic);
  const scaleLabels = scaleNotes.map((n) => getNoteLabel(tonic, n, TONALITY.MAJOR));

  return {
    notes: scaleNotes,
    labels: scaleLabels as NoteLabel[],
  };
}

export function getMinorNaturalScaleNotes(tonic: Note): Note[] {
  // just use the relative major
  const relativeMajorTonic = ((tonic + 3) % 12) as Note;
  const relativeMajorNotes = getMajorScaleNotes(relativeMajorTonic);
  const relativeMinorNotes = wrapArray(relativeMajorNotes, 5);
  return relativeMinorNotes;
}

export function getMinorNaturalScale(tonic: Note): Sequence {
  const scaleNotes = getMinorNaturalScaleNotes(tonic);
  const scaleLabels = scaleNotes.map((n) => getNoteLabel(tonic, n, TONALITY.MINOR_NATURAL));

  return {
    notes: scaleNotes,
    labels: scaleLabels as NoteLabel[],
  };
}

export function getMinorHarmonicScaleNotes(tonic: Note): Note[] {
  // just raise the 7th of the natural minor
  const scaleNotes = getMinorNaturalScaleNotes(tonic);
  scaleNotes[6] = (scaleNotes[6] + 1) % 12 as Note;
  return scaleNotes;
}

export function getMinorHarmonicScale(tonic: Note): Sequence {
  const scaleNotes = getMinorHarmonicScaleNotes(tonic);
  const scaleLabels = scaleNotes.map((n) => getNoteLabel(tonic, n, TONALITY.MINOR_HARMONIC));

  return {
    notes: scaleNotes,
    labels: scaleLabels as NoteLabel[],
  };
}

export function getMinorMelodicScaleNotes(tonic: Note): Note[] {
  // just lower the 3rd of the tonic major
  const scaleNotes = getMajorScaleNotes(tonic);
  scaleNotes[2] = (scaleNotes[2] + 11) % 12 as Note;

  return scaleNotes;
}

export function getMinorMelodicScale(tonic: Note): Sequence {
  const scaleNotes = getMinorMelodicScaleNotes(tonic);
  const scaleLabels = scaleNotes.map((n) => getNoteLabel(tonic, n, TONALITY.MINOR_MELODIC));

  return {
    notes: scaleNotes,
    labels: scaleLabels as NoteLabel[],
  };
}

export function getScale(tonic: Note, tonality: TONALITY): Sequence {
  return tonalityUtilsMap.scaleFunction[tonality](tonic);
}

export function clickDocument() {
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  setTimeout(() => {
    document.querySelector('main')?.dispatchEvent(clickEvent);
  }, 20);
}

// a w s e d f t g y h u j k o l p ; '

export const charToNoteMap = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
  p: 15,
  ';': 16,
  "'": 17,
};
