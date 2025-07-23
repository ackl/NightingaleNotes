import { buildWholeSequence, Sequence } from '../core/primitives';

/*
  * have samples per minor third
  * can't just use one sample and pitch shift it cos we need the overtones to match (approx).
  * 0  3   6   9
  * C  D#  F#  A
*/
export function getSampleForNote(note: number) {
  // first get closest lower sample note label
  const modNote = note % 12;
  let fileNamePrefix = 'A';
  if (modNote < 3) {
    fileNamePrefix = 'C';
  } else if (modNote < 6) {
    fileNamePrefix = 'Ds';
  } else if (modNote < 9) {
    fileNamePrefix = 'Fs';
  }

  // append the octave number
  // our lowest C is C2 which is octave 0
  const octaveNumber = Math.floor(note / 12);

  return {
    sample: `${fileNamePrefix}${octaveNumber + 3}` as SampleName,
    detune: modNote % 3,
  };
}

export const sampleFilenames = ['C2', 'Ds2', 'Fs2', 'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4',
  'Ds4', 'Fs4', 'A4', 'C5', 'Ds5', 'Fs5', 'A5', 'C6', 'Ds6', 'Fs6', 'A6'] as const;

type SampleName = (typeof sampleFilenames)[number];
type ArrayBuffers = Partial<Record<SampleName, ArrayBuffer>>;
type AudioBuffers = Partial<Record<SampleName, AudioBuffer>>;

export class AudioContextManager {
  ctx: AudioContext;

  filenames: readonly SampleName[];

  arrayBuffers: ArrayBuffers;

  audioBuffers: AudioBuffers;

  fetched: Set<SampleName>;

  currentlyFetching: Set<SampleName>;

  decoded: Set<SampleName>; // Track which samples have been decoded

  private constructor(ctx: AudioContext) {
    this.filenames = sampleFilenames;
    this.arrayBuffers = {};
    this.audioBuffers = {};
    this.fetched = new Set();
    this.currentlyFetching = new Set();
    this.decoded = new Set();
    this.ctx = ctx;
  }

  static instantiate = async () => {
    const audioContext = new AudioContext();
    await this.unlockAudioContext(audioContext);

    const instance = new AudioContextManager(audioContext);
    await instance.fetchEssentials();
    return instance;
  };

  static unlockAudioContext = async (ctx: AudioContext) => {
    // Ensure audio context will play on iOS safari
    // even if device is muted.
    if ('audioSession' in navigator) {
      try {
        (navigator.audioSession as any).type = 'playback';
      } catch (error) {
        console.error(error);
        // Ignore errors if audioSession API is not available
      }
    }

    const unlock = () => {
      ctx.resume().then(() => {
        // Play silent buffer to truly unlock iOS Safari
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        // Clean up
        ['touchstart', 'touchend', 'click'].forEach((e) => document.removeEventListener(e, unlock));
      });
    };

    ['touchstart', 'touchend', 'click']
      .forEach((e) => document.addEventListener(e, unlock));
  };

  playTone = async (
    noteValue: number,
    when = 0,
  ) => {
    if (!this.ctx) return;

    const sampleInfo = getSampleForNote(noteValue);

    if (this.ctx && this.audioBuffers) {
      const source = this.ctx.createBufferSource();
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = 1;

      const audioBuffer = this.audioBuffers[sampleInfo.sample];
      if (!audioBuffer) return;

      source.buffer = audioBuffer;
      source.detune.value = sampleInfo.detune * 100;

      source.onended = () => { };

      // Visual feedback
      const safeNoteValue = Math.max(0, Math.min(127, noteValue));
      const $el = document.querySelector(`.ivory--${safeNoteValue}`);
      setTimeout(() => {
        $el?.classList.add('flash');
        setTimeout(() => {
          $el?.classList.remove('flash');
        }, 600);
      }, when * 1000);

      source.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      try {
        source.start(this.ctx.currentTime + when);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Plays notes as a chord i.e. all notes at once
  playChord = (notes: number[]) => {
    notes.forEach((n) => this.playTone(n, 0));
  };

  // Plays notes sequentially one after the other
  // used for scales and arpeggios etc.
  playSequence = (notes: number[]) => {
    notes.forEach((n, i) => {
      this.playTone(n, i / 4);
    });
  };

  playNotes = (sequence: Sequence, octaves: number) => {
    const sequenceNotes = buildWholeSequence(sequence, octaves);
    // Use expanded sequence length to determine chord vs arpeggio
    const playFn = sequenceNotes.length > 6 ? this.playSequence : this.playChord;
    playFn(sequenceNotes);
  };

  // Load essential samples for immediate playback (current octave range)
  fetchEssentials = async () => {
    const essentialSamples = ['C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4'] as SampleName[];
    return this.fetchSamples(essentialSamples);
  };

  // Load specific samples on demand
  async fetchSamples(samples: SampleName[]) {
    const toFetch = samples.filter(
      (sample) => !this.fetched.has(sample) && !this.currentlyFetching.has(sample),
    );

    if (toFetch.length === 0) return;

    // Mark as currently fetching
    toFetch.forEach((sample) => this.currentlyFetching.add(sample));

    try {
      const responses = await Promise.all(
        toFetch.map(async (sample) => {
          const response = await fetch(`/${sample}v8.mp3`);
          return response.arrayBuffer();
        }),
      );

      responses.forEach((res, i) => {
        const sample = toFetch[i];
        this.arrayBuffers[sample] = res;
        this.fetched.add(sample);
        this.currentlyFetching.delete(sample);
      });
    } catch (error) {
      // Remove from fetching set on error
      toFetch.forEach((sample) => this.currentlyFetching.delete(sample));
      throw error;
    }

    this.loadIntoContext();
  }

  // Get samples needed for a specific octave range
  getSamplesForOctaveRange(minOctave: number, maxOctave: number): SampleName[] {
    return this.filenames.filter((sample) => {
      const octave = parseInt(sample.slice(-1), 10);
      return octave >= minOctave && octave <= maxOctave;
    });
  }

  // Legacy method for backward compatibility
  async fetch() {
    return this.fetchSamples([...sampleFilenames]);
  }

  loadIntoContext = async () => {
    const decodePromises = Object.entries(this.arrayBuffers)
      .filter(([note]) => {
        const sampleName = note as SampleName;
        return !this.decoded.has(sampleName) && !this.audioBuffers[sampleName];
      })
      .map(async ([note, arrayBuf]) => {
        const sampleName = note as SampleName;
        this.decoded.add(sampleName); // Mark as being decoded

        return this.ctx
          .decodeAudioData(arrayBuf)
          .then((sample) => {
            this.audioBuffers[sampleName] = sample;
            return { sampleName, success: true };
          })
          .catch((error) => {
            console.error(`Failed to decode audio data for ${note}:`, error);
            // Remove from decoded set if decoding fails so we can retry
            this.decoded.delete(sampleName);
            return { sampleName, success: false, error };
          });
      });

    if (decodePromises.length > 0) {
      await Promise.all(decodePromises);
    }
  };

  // Check if a sample is ready for playback
  isSampleReady(sample: SampleName): boolean {
    return this.audioBuffers?.[sample] !== undefined;
  }
}
