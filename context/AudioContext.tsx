import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Audio } from 'expo-av';

interface AudioContextValue {
  playingId: string | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  play: (id: string, uri: string, onPlayCount?: () => void) => Promise<void>;
  pause: () => Promise<void>;
  toggle: (id: string, uri: string, onPlayCount?: () => void) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const playCountCalledRef = useRef<string | null>(null);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (id: string, uri: string, onPlayCount?: () => void) => {
      if (playingId === id && soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      await unload();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      );

      soundRef.current = sound;
      setPlayingId(id);
      setIsPlaying(true);

      if (playCountCalledRef.current !== id) {
        playCountCalledRef.current = id;
        onPlayCount?.();
      }
    },
    [playingId, unload]
  );

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(
    async (id: string, uri: string, onPlayCount?: () => void) => {
      if (playingId === id && isPlaying) {
        await pause();
      } else {
        await play(id, uri, onPlayCount);
      }
    },
    [playingId, isPlaying, play, pause]
  );

  const seek = useCallback(async (positionMs: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMs);
      setPosition(positionMs);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{ playingId, isPlaying, position, duration, play, pause, toggle, seek }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
