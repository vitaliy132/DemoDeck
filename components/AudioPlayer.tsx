import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useAudio } from '@/context/AudioContext';
import { formatDuration } from '@/lib/demos';
import { colors, fonts, radius, spacing } from '@/theme';

interface AudioPlayerProps {
  demoId: string;
  audioUrl: string;
  onPlayCount?: () => void;
  full?: boolean;
}

export function AudioPlayer({ demoId, audioUrl, onPlayCount, full = false }: AudioPlayerProps) {
  const { playingId, isPlaying, position, duration, toggle, seek } = useAudio();
  const isActive = playingId === demoId;
  const activePlaying = isActive && isPlaying;

  const progress = duration > 0 ? position / duration : 0;

  const handleToggle = () => toggle(demoId, audioUrl, onPlayCount);

  const handleSeek = (event: { nativeEvent: { locationX: number } }, width: number) => {
    if (!isActive || duration <= 0) return;
    const ratio = event.nativeEvent.locationX / width;
    seek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <View style={[styles.container, full && styles.containerFull]}>
      <Pressable onPress={handleToggle} style={styles.playButton}>
        <SymbolView
          name={{
            ios: activePlaying ? 'pause.fill' : 'play.fill',
            android: activePlaying ? 'pause' : 'play_arrow',
            web: activePlaying ? 'pause' : 'play_arrow',
          }}
          size={full ? 28 : 20}
          tintColor={full ? colors.background : colors.text}
        />
      </Pressable>

      <View style={styles.trackWrapper}>
        <Pressable
          style={styles.track}
          onPress={(e) => handleSeek(e, full ? 280 : 200)}>
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
        </Pressable>
        {full ? (
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatDuration(position / 1000)}</Text>
            <Text style={styles.time}>
              {formatDuration((duration || 0) / 1000)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  containerFull: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackWrapper: {
    flex: 1,
    gap: spacing.xs,
  },
  track: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
});
