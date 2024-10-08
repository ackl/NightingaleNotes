export enum TONALITY {
  MAJOR = 'Major',
  MINOR_NATURAL = 'Minor Natural',
  MINOR_HARMONIC = 'Minor Harmonic',
  MINOR_MELODIC = 'Minor Melodic (ascending/jazz)',
}

export const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

// get 0 - 59 (full range of our keyboard)
// new Array(5).fill(null).flatMap((x, i) => notes.map(n => n + (i*12)))
// then make map of note to filename per major third
// then create sampler (rest of the fucking owl)


export const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Give flats to all but C and F
const majorKeyLabels = noteLabels.flatMap((prev, i) => {
    return (i !== 0 && i !== 3) ?  [prev + 'b', prev] : [prev]
})

// Give sharps to all but E and A and B. give flat to B
const minorKeyLabels = noteLabels.flatMap((prev, i) => {
    if (i === 2 || i === 6)  {
      return [prev + 'b', prev];
    }
    if (i === 1 || i === 5) return [prev];

    return [prev, prev + '#']
})

//export const enharmonicLabels = [ 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B' ];
export const majorScaleDiatonicChordRomanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export const minorNaturalScaleDiatonicChordRomanNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
export const minorHarmonicScaleDiatonicChordRomanNumerals = ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']
export const minorMelodicScaleDiatonicChordRomanNumerals = ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°']

const majorScaleDiatonicChordTypes: CHORD_TYPE[] = ['M', 'm', 'm', 'M', 'M', 'm', 'd']
const minorNaturalScaleDiatonicChordTypes: CHORD_TYPE[] = wrapArray(majorScaleDiatonicChordTypes, 5)
const minorHarmonicScaleDiatonicChordTypes: CHORD_TYPE[] = [
  'm', 'd', '+', 'm', 'M', 'M', 'd'
]
const minorMelodicScaleDiatonicChordTypes: CHORD_TYPE[] = [
  'm', 'm', '+', 'M', 'M', 'd', 'd'
]

export function getDiatonicChordRomanNumerals(tonality: TONALITY) {
  return tonalityUtilsMap['triadsRomanNumerals'][tonality];
}

// can also use this as the intervals of a Maj scale
export const whiteKeys =  [0, 2, 4, 5, 7, 9, 11];
export const blackKeys =  [1, 3, 6, 8, 10]

export enum INTERVALS {
  THIRD_MINOR = 3,
  THIRD_MAJOR = 4,
  FOURTH_PERFECT = 5,
  TRITONE = 6,
  FIFTH_PERFECT = 7,
  FIFTH_AUGMENTED = 8
}

export enum CHORD_TYPE_ENUM {
  MAJOR = 'M',
  MINOR = 'm',
  DIM = 'd',
  AUG = '+'
}

type CHORD_TYPE =`${CHORD_TYPE_ENUM}`;

export const CHORD_TYPE_INTERVALS_MAP = {
  [CHORD_TYPE_ENUM.MAJOR]: [0, INTERVALS.THIRD_MAJOR, INTERVALS.FIFTH_PERFECT],
  [CHORD_TYPE_ENUM.MINOR]: [0, INTERVALS.THIRD_MINOR, INTERVALS.FIFTH_PERFECT],
  [CHORD_TYPE_ENUM.DIM]: [0, INTERVALS.THIRD_MINOR, INTERVALS.TRITONE],
  [CHORD_TYPE_ENUM.AUG]: [0, INTERVALS.THIRD_MAJOR, INTERVALS.FIFTH_AUGMENTED]
}

export function buildChord(root: Note, chordType: CHORD_TYPE) {
  const intervals = CHORD_TYPE_INTERVALS_MAP[chordType]

  return intervals.map(i => getNoteFromInterval(root, i))
}

const tonalityUtilsMap = {
  triads: {
    [TONALITY.MAJOR]: majorScaleDiatonicChordTypes,
    [TONALITY.MINOR_NATURAL]: minorNaturalScaleDiatonicChordTypes,
    [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleDiatonicChordTypes,
    [TONALITY.MINOR_MELODIC]: minorMelodicScaleDiatonicChordTypes
  },
  triadsRomanNumerals: {
    [TONALITY.MAJOR]: majorScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_NATURAL]: minorNaturalScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_HARMONIC]: minorHarmonicScaleDiatonicChordRomanNumerals,
    [TONALITY.MINOR_MELODIC]: minorMelodicScaleDiatonicChordRomanNumerals
  },
  scaleFunction: {
    [TONALITY.MAJOR]: getMajorScale,
    [TONALITY.MINOR_NATURAL]: getMinorNaturalScale,
    [TONALITY.MINOR_HARMONIC]: getMinorHarmonicScale,
    [TONALITY.MINOR_MELODIC]: getMinorMelodicScale,
  },
}

export function buildDiatonicTriads(tonic: Note, tonality: TONALITY): Sequence[] {
  const scale = getScale(tonic, tonality);
  //const tonicLabel = tonality === TONALITY.MAJOR ?
    //majorKeyLabels[tonic][0] : minorKeyLabels[tonic][0];

  //const tonicLabelIdx = noteLabels.indexOf(tonicLabel);

  return scale.notes.map((root, i) => {
    //const rootNoteLabel = noteLabels[(tonicLabelIdx + i) % 12]
    const chordType = tonalityUtilsMap['triads'][tonality][i]
    const triad = buildChord(root as Note, chordType)

    return {
      //labels: getTriadLabel(rootNoteLabel),
      labels: [],
      notes: triad
    }
  });
}

//function getTriadLabel(noteLabel: string) {
  //const idx = noteLabels.indexOf(noteLabel);
  //const thirdIndex = (idx + 2) % 12;
  //const fifthIndex = (idx + 4) % 12;

  //return [noteLabel, noteLabels[thirdIndex], noteLabels[fifthIndex]];
//}

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

export enum accidental {
  SHARP = '♯',
  FLAT = '♭',
  NATURAL = '♮',
  DOUBLE_SHARP = '𝄪'
}

//export function getEnharmonicLabel(note: Note) {
  //return enharmonicLabels[notes.indexOf(note)]
//}

export function getMajorKeyLabel(note: Note) {
  return majorKeyLabels[notes.indexOf(note)]
}

export function getMinorKeyLabel(note: Note) {
  return minorKeyLabels[notes.indexOf(note)]
}


export function getNoteLabel(tonic: Note, note: Note, tonality: TONALITY) {
  if (tonality === TONALITY.MINOR_MELODIC) {
    // since default return is to flatten label, use sharpened enharmonic for
    // 7th degree for some cases to maintain diatonic scale spelling. i.e:
    // C into B# if tonic is C#
    // Db into C# if tonic is D
    // F into E# if tonic is F#
    // Gb into F# if tonic is G
    if ([1, 2, 6, 7].includes(tonic) && note === (tonic - 1)) {
      return sharpen(note ? note : 12 as Note);
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
  } else if (tonality === TONALITY.MINOR_NATURAL) {
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
  } else if (tonality === TONALITY.MINOR_HARMONIC) {
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

export function sharpen(note: Note) {
  const idx = whiteKeys.indexOf(note - 1);
  return `${noteLabels[idx]}${accidental['SHARP']}`
}
export function flatten(note: Note) {
  const idx = whiteKeys.indexOf(note + 1);
  return `${noteLabels[idx]}${accidental['FLAT']}`
}
export function natural(note: Note) {
  const idx = whiteKeys.indexOf(note);
  return `${noteLabels[idx]}${accidental['NATURAL']}`
}
export function doubleSharp(note: Note) {
  const idx = whiteKeys.indexOf(note);
  return `${noteLabels[idx]}${accidental['DOUBLE_SHARP']}`
}

export function generateScale(tonic: Note, scaleType: TONALITY, getScaleNotes: (tonic: Note) => number[]) {
  const scaleNotes = getScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n as Note, scaleType));

  return {
    notes: scaleNotes,
    labels: scaleLabels
  }
}

export function getMajorScaleNotes(tonic: Note) {
  return whiteKeys.map(interval => getNoteFromInterval(tonic, interval))

}

export function getMajorScale(tonic: Note) {
  const scaleNotes = getMajorScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n, TONALITY.MAJOR));

  return {
    notes: scaleNotes,
    labels: scaleLabels
  }
}

export function getMinorNaturalScaleNotes(tonic: Note): Note[] {
  // just use the relative major
  const relativeMajorTonic = ((tonic + 3) % 12) as Note;
  const relativeMajorNotes = getMajorScaleNotes(relativeMajorTonic);
  const relativeMinorNotes = wrapArray(relativeMajorNotes, 5);
  return relativeMinorNotes;
}


export function getMinorNaturalScale(tonic: Note) {
  const scaleNotes = getMinorNaturalScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_NATURAL));

  return {
    notes: scaleNotes,
    labels: scaleLabels
  }
}

export function getMinorHarmonicScaleNotes(tonic: Note): Note[] {
  // just raise the 7th of the natural minor
  const scaleNotes = getMinorNaturalScaleNotes(tonic);
  scaleNotes[6] = (scaleNotes[6] + 1) % 12 as Note;
  return scaleNotes;
}


export function getMinorHarmonicScale(tonic: Note) {
  const scaleNotes = getMinorHarmonicScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_HARMONIC));

  return {
    notes: scaleNotes,
    labels: scaleLabels
  }
}

export function getMinorMelodicScaleNotes(tonic: Note): Note[] {
  // just lower the 3rd of the tonic major
  const scaleNotes = getMajorScaleNotes(tonic);
  scaleNotes[2] = (scaleNotes[2] + 11) % 12 as Note;

  return scaleNotes;
}


export function getMinorMelodicScale(tonic: Note) {
  const scaleNotes = getMinorMelodicScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_MELODIC));

  return {
    notes: scaleNotes,
    labels: scaleLabels
  }
}

export function getScale(tonic: Note, tonality: TONALITY): Sequence {
  return tonalityUtilsMap['scaleFunction'][tonality](tonic);
}

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

export function leadingDebounce(func: Function, delay: number) {
  let timeout: number | null;
  return function(...args: any[]) {
    const callNow = !timeout;
    clearTimeout(timeout as number);
    timeout = setTimeout(() => {
      timeout = null;
    }, delay);
    // @ts-ignore
    if (callNow) func.apply(this, args);
  };
}
