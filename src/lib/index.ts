type GetKeysOf<T> = keyof T
type GetValuesOf<T> = T[keyof T]

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

type Accidentals = typeof accidentals;
export type AccidentalName = GetKeysOf<Accidentals>;
export type AccidentalSymbol = GetValuesOf<Accidentals>;

export const noteLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const satisfies string[];
export type NoteLabelBase = typeof noteLabels[number];
export type NoteLabel = `${NoteLabelBase}${AccidentalSymbol}` | NoteLabelBase

export type Sequence = {
  notes: Note[],
  labels: NoteLabel[]
}

type KeySignatureAccidentalType = Exclude<AccidentalName, 'DOUBLE_FLAT' | 'DOUBLE_SHARP'>

// can also use this as the intervals of a Maj scale
export const whiteKeys: Note[] =  [0, 2, 4, 5, 7, 9, 11];
export const blackKeys: Note[] =  [1, 3, 6, 8, 10]

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

export type IntervalSymbol = GetKeysOf<typeof INTERVALS>


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

const baseToNatural: Record<NoteLabelBase, Note> = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11,
};

function findBaseLetterAndAccidental(note: Note, accidentalType?: 'SHARP' | 'FLAT'): { base: NoteLabelBase, accidental: AccidentalSymbol | '' } {
    if (accidentalType === 'FLAT') {
      if (note === 11) {
        return { base: 'C', accidental: accidentals.FLAT };
      }

      for (const base of noteLabels) {
        const natural = baseToNatural[base];
        if ((natural - 1 + 12) % 12 === note) {
            return { base, accidental: accidentals.FLAT };
        }
      }
    }

    if (accidentalType === 'SHARP') {
      for (const base of noteLabels) {
        const natural = baseToNatural[base];
        if ((natural + 1) % 12 === note) {
          return { base, accidental: accidentals.SHARP };
        }
      }
    }

    for (const base of noteLabels) {
        const natural = baseToNatural[base];
        console.log({base, natural});
        if (natural === note) {
            return { base, accidental: '' };
        }
    }

    throw new Error(`Cannot find base letter for note ${note}`);
}

function calculateDifference(actualNote: Note, naturalNote: Note): number {
    let difference = actualNote - naturalNote;
    if (difference > 6) {
        difference -= 12;
    } else if (difference < -6) {
        difference += 12;
    }
    return difference;
}

function getAccidentalSymbol(difference: number): AccidentalSymbol | '' {
    if (difference === 0) return '';
    if (difference === 1) return accidentals.SHARP;
    if (difference === -1) return accidentals.FLAT;
    if (difference === 2) return accidentals.DOUBLE_SHARP;
    if (difference === -2) return accidentals.DOUBLE_FLAT;
    // Handle other cases if necessary
    throw new Error(`Unsupported accidental difference: ${difference}`);
}

export function getKeySignatures(tonic: Note, tonality: TONALITY): KeySignature[] {
    // Adjust tonic for minor tonalities to their relative major
    console.log('getting keysig for tonic:', tonic);
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
        accidentalTypes.push('SHARP', 'FLAT');
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
        console.log({tonicInfo})
        const baseLetters = getBaseLetters(tonicInfo.base);

        // Calculate labels considering key accidentals and scale alterations
        const labels = scaleNotes.map((note, i) => {
            const baseLetter = baseLetters[i];
            const naturalNote = baseToNatural[baseLetter];
            
            // Check if this note is affected by key signature
            const keyAdjustedNote = accidentalsList.includes(naturalNote)
                ? type === 'SHARP'
                    ? (naturalNote + 1) % 12
                    : (naturalNote - 1 + 12) % 12
                : naturalNote;

            if (note === keyAdjustedNote) {
                const accidental = accidentalsList.includes(naturalNote) ? accidentals[type] : '';
                return accidental ? `${baseLetter}${accidental}` : baseLetter;
            } else {
                const difference = calculateDifference(note, naturalNote);
                const accidental = getAccidentalSymbol(difference);
                return accidental ? `${baseLetter}${accidental}` : baseLetter;
            }
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


export enum CHORD_TYPE_ENUM {
  MAJOR = 'M',
  MINOR = 'm',
  DIM = 'd',
  AUG = '+'
}

type CHORD_TYPE =`${CHORD_TYPE_ENUM}`;

export const CHORD_TYPE_INTERVALS_MAP = {
  [CHORD_TYPE_ENUM.MAJOR]: [0, INTERVALS.M3, INTERVALS.P5],
  [CHORD_TYPE_ENUM.MINOR]: [0, INTERVALS.m3, INTERVALS.P5],
  [CHORD_TYPE_ENUM.DIM]: [0, INTERVALS.m3, INTERVALS.d5],
  [CHORD_TYPE_ENUM.AUG]: [0, INTERVALS.M3, INTERVALS.A5]
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

export function buildDiatonicTriads(keySignature: KeySignature): Sequence[] {
  const scale = keySignature.scaleAscending;
  //const tonicLabel = tonality === TONALITY.MAJOR ?
    //majorKeyLabels[tonic][0] : minorKeyLabels[tonic][0];

  //const tonicLabelIdx = noteLabels.indexOf(tonicLabel);

  return scale.notes.map((root, i) => {
    //const rootNoteLabel = noteLabels[(tonicLabelIdx + i) % 12]
    const chordType = tonalityUtilsMap['triads'][keySignature.tonality][i]
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

    if (note === 12 as Note) {
      return natural(0);
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

    if (note === 12 as Note) {
      return natural(0);
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
  //return `${noteLabels[idx]}`
}
export function doubleSharp(note: Note) {
  const idx = whiteKeys.indexOf(note);
  return `${noteLabels[idx]}${accidental['DOUBLE_SHARP']}`
}

export function generateScale(tonic: Note, scaleType: TONALITY, getScaleNotes: (tonic: Note) => number[]) {
  const scaleNotes = getScaleNotes(tonic);
  const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n as Note, scaleType));
  //console.log(tonic, scaleType, scaleLabels);

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
  //const scaleLabels = scaleNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_NATURAL));
  const shiftedNotes = shiftNote0When0NotTonic(scaleNotes);
  const scaleLabels = shiftedNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_NATURAL));

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
  const shiftedNotes = shiftNote0When0NotTonic(scaleNotes);
  const scaleLabels = shiftedNotes.map(n => getNoteLabel(tonic, n, TONALITY.MINOR_HARMONIC));

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

export function shiftNote0When0NotTonic(arr) {
  const zeroIndex = arr.findIndex((value, index) => value === 0 && index !== 0);
  if (zeroIndex > -1) {
    const newArr = arr.map((value, index) => index === zeroIndex ? value + 12 : value);
    return newArr;
  }

  return arr
}

export function getScale(tonic: Note, tonality: TONALITY): Sequence {
  const ret = tonalityUtilsMap['scaleFunction'][tonality](tonic);
  return ret;
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



// class KeySignature {
//   private readonly tonic: Note;
//   private readonly mode: TONALITY;
//   private accidentals = new Map<PitchClass, Accidental>();
//
//   constructor(tonic: Note, mode: TONALITY) {
//     this.tonic = tonic;
//     this.mode = mode;
//     this.calculateAccidentals();
//   }
//
//   private calculateAccidentals() {
//     const keyIndex = CIRCLE_OF_FIFTHS.indexOf(this.getKeyName());
//     const numAccidentals = Math.abs(keyIndex - 11); // Adjust for circle position
//     
//     if (keyIndex <= 11) { // Sharps
//       SHARPS_ORDER.slice(0, numAccidentals).forEach(pc => 
//         this.accidentals.set(pc, '♯'));
//     } else { // Flats
//       FLATS_ORDER.slice(0, numAccidentals).forEach(pc => 
//         this.accidentals.set(pc, '♭'));
//     }
//
//     // Handle minor keys
//     if (this.mode !== TONALITY.MAJOR) {
//       this.handleMinorAccidentals();
//     }
//   }
//
//   private handleMinorAccidentals() {
//     // Harmonic minor: raised 7th
//     if (this.mode === TONALITY.MINOR_HARMONIC) {
//       const leadingTone = (this.tonic + 11) % 12;
//       const pc = this.getPitchClass(leadingTone as Note);
//       this.accidentals.set(pc, '♯');
//     }
//     
//     // Melodic minor: raised 6/7 ascending
//     if (this.mode === TONALITY.MINOR_MELODIC) {
//       const sixth = (this.tonic +8) % 12;
//       const seventh = (this.tonic + 11) % 12;
//       [sixth, seventh].forEach(n => {
//         const pc = this.getPitchClass(n as Note);
//         this.accidentals.set(pc, '♯');
//       });
//     }
//   }
//
//   getAccidentalFor(note: Note): Accidental | undefined {
//     const pc = this.getPitchClass(note);
//     return this.accidentals.get(pc);
//   }
//
//   getPitchClass(note: Note): PitchClass {
//     // Convert note number to pitch class
//     return noteLabels[note % 12] as PitchClass;
//   }
//
//   getKeyName(): string {
//     const basePitch = noteLabels[this.tonic % 12] as PitchClass;
//     const modeStr = this.mode === TONALITY.MAJOR ? 'Major' : 'Minor';
//     
//     if (this.mode === TONALITY.MAJOR) {
//       return this.getMajorKeyName(basePitch);
//     }
//     return this.getMinorKeyName(basePitch);
//   }
//
//   private getMajorKeyName(basePitch: PitchClass): string {
//     const circleIndex = CIRCLE_OF_FIFTHS.findIndex(key => 
//       key.replace(/[♯♭]/, '') === basePitch
//     );
//     
//     if (circleIndex > -1) {
//       const preferredName = CIRCLE_OF_FIFTHS[circleIndex];
//       const altName = this.getEnharmonicAlternative(basePitch);
//       
//       // Prefer name with fewer accidentals
//       const numAccidentals = Math.min(
//         circleIndex,
//         CIRCLE_OF_FIFTHS.length - circleIndex
//       );
//       
//       return numAccidentals <= 6 ? preferredName : altName;
//     }
//     
//     return `${basePitch} Major`;
//   }
//
//   private getMinorKeyName(basePitch: PitchClass): string {
//     const relativeMajor = (this.tonic + 3) % 12;
//     const majorKeyName = new KeySignature(
//       relativeMajor as Note, 
//       TONALITY.MAJOR
//     ).getKeyName().replace(' Major', '');
//     
//     return `${basePitch} Minor (rel. ${majorKeyName})`;
//   }
//
//   private getEnharmonicAlternative(pitch: PitchClass): string {
//     const altPitch = ENHARMONIC_EQUIVALENTS[pitch]?.['♭'] || pitch;
//     const hasFlats = CIRCLE_OF_FIFTHS.some(key => key.includes('♭'));
//     
//     return hasFlats 
//       ? `${altPitch}${accidental.FLAT}` 
//       : `${pitch}${accidental.SHARP}`;
//   }
// }

class EnharmonicHelper {
  private static ENHARMONIC_EQUIVALENTS: Record<PitchClass, Record<Accidental, string>> = {
    'C': { 
      '♯': 'B♯', 
      '♭': 'D♭', 
      '𝄪': 'B𝄪', 
      '𝄫': 'D𝄫', 
      '♮': 'C' 
    },
    'D': { 
      '♯': 'C𝄪', 
      '♭': 'E♭', 
      '𝄪': 'C𝄪', 
      '𝄫': 'E𝄫', 
      '♮': 'D' 
    },
    'E': { 
      '♯': 'D𝄪', 
      '♭': 'F♭', 
      '𝄪': 'D𝄪', 
      '𝄫': 'F𝄫', 
      '♮': 'E' 
    },
    'F': { 
      '♯': 'E♯', 
      '♭': 'G♭', 
      '𝄪': 'E𝄪', 
      '𝄫': 'G𝄫', 
      '♮': 'F' 
    },
    'G': { 
      '♯': 'F𝄪', 
      '♭': 'A♭', 
      '𝄪': 'F𝄪', 
      '𝄫': 'A𝄫', 
      '♮': 'G' 
    },
    'A': { 
      '♯': 'G𝄪', 
      '♭': 'B♭', 
      '𝄪': 'G𝄪', 
      '𝄫': 'B𝄫', 
      '♮': 'A' 
    },
    'B': { 
      '♯': 'A𝄪', 
      '♭': 'C♭', 
      '𝄪': 'A𝄪', 
      '𝄫': 'C𝄫', 
      '♮': 'B' 
    }
  }

  static getPreferredEnharmonic(
    note: Note, 
    context: KeySignature
  ): string {
    const accidental = context.getAccidentalFor(note);
    const pc = context.getPitchClass(note);
    
    // Get spelling based on key context
    if (accidental) {
      return `${pc}${accidental}`;
    }
    
    // Default to natural
    return `${pc}♮`;
  }

  static getAllEnharmonics(note: Note): string[] {
    const enharmonics: string[] = [];
    const naturalNotes: Record<PitchClass, number> = {
      'C': 0,
      'D': 2,
      'E': 4,
      'F': 5,
      'G': 7,
      'A': 9,
      'B': 11
    };

    const accidentals: Accidental[] = ['♮', '♯', '♭', '𝄪', '𝄫'];

    (Object.keys(naturalNotes) as PitchClass[]).forEach((pitchClass) => {
      const natural = naturalNotes[pitchClass];
      accidentals.forEach((accidental) => {
        let offset = 0;
        switch (accidental) {
          case '♯':
            offset = 1;
          break;
          case '♭':
            offset = -1;
          break;
          case '𝄪':
            offset = 2;
          break;
          case '𝄫':
            offset = -2;
          break;
          case '♮':
            offset = 0;
          break;
        }
        const adjusted = (natural + offset + 12) % 12; // +12 to avoid negative modulo
        if (adjusted === note) {
          const spelling = accidental === '♮' ? pitchClass : `${pitchClass}${accidental}`;
          enharmonics.push(spelling);
        }
      });
    });

    return enharmonics;
  }
}
