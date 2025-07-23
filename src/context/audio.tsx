import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { SettingsContext } from './settings';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AudioContextManager } from '../lib/utils/audioContextManager';

export interface AudioContextState {
  audioContextManager: AudioContextManager | null;
}

export const initialAudioContextState: AudioContextState = {
  audioContextManager: null,
};

export const AudioReactContext = createContext<AudioContextState>(
  initialAudioContextState,
);

export function AudioReactProvider({ children }: { children: ReactNode }) {
  const { octaves } = useContext(SettingsContext);

  const [audioContextManager, setAudioContextManager] = useState<AudioContextManager | null>(
    initialAudioContextState.audioContextManager,
  );

  useEffect(() => {
    async function init() {
      const instance = await AudioContextManager.instantiate();
      setAudioContextManager(instance);
    }

    init();
  }, []);

  // Load additional samples when octave range changes
  useEffect(() => {
    if (audioContextManager && octaves > 2) {
      const currentOctave = Math.floor(octaves / 2) + 2; // Estimate middle octave
      const neededSamples = audioContextManager.getSamplesForOctaveRange(
        Math.max(2, currentOctave - 1),
        Math.min(6, currentOctave + Math.ceil(octaves / 2)),
      );

      audioContextManager.fetchSamples(neededSamples);
    }
  }, [audioContextManager, octaves]);

  const contextValue = useMemo(() => ({ audioContextManager }), [audioContextManager]);

  return (
    <ErrorBoundary>
      <AudioReactContext.Provider
        value={contextValue}
      >
        {children}
      </AudioReactContext.Provider>
    </ErrorBoundary>
  );
}
