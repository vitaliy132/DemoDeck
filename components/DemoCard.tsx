import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import {
  formatDuration,
  hasReposted,
  incrementPlayCount,
  isDemoLiked,
  repostDemo,
  toggleLike,
} from '@/lib/demos';
import { Demo, UserProfile } from '@/lib/types';
import { colors, fonts, spacing } from '@/theme';

import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';

interface DemoCardProps {
  demo: Demo;
  author?: UserProfile;
  repostedBy?: UserProfile;
  showRank?: number;
  showScore?: number;
  onUpdate?: () => void;
}

export function DemoCard({
  demo,
  author,
  repostedBy,
  showRank,
  showScore,
  onUpdate,
}: DemoCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { playingId, isPlaying, toggle } = useAudio();
  const isActive = playingId === demo.id && isPlaying;

  const handlePlay = async () => {
    await toggle(demo.id, demo.audioUrl, () => incrementPlayCount(demo.id));
  };

  const handleLike = async () => {
    if (!user) return;
    const liked = await isDemoLiked(demo.id, user.uid);
    await toggleLike(demo.id, user.uid, liked);
    onUpdate?.();
  };

  const handleRepost = async () => {
    if (!user) return;
    const already = await hasReposted(user.uid, demo.id);
    if (already) return;
    await repostDemo(user.uid, demo.id);
    onUpdate?.();
  };

  const displayName = author?.displayName ?? author?.username ?? 'Unknown';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/demo/${demo.id}`)}>
      {repostedBy ? (
        <View style={styles.repostHeader}>
          <SymbolView name={{ ios: 'arrow.2.squarepath', android: 'refresh', web: 'refresh' }} size={12} tintColor={colors.textMuted} />
          <Text style={styles.repostText}>
            Reposted by @{repostedBy.username}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        {showRank !== undefined ? (
          <Text style={styles.rank}>{String(showRank).padStart(2, '0')}</Text>
        ) : null}

        <View style={styles.content}>
          <View style={styles.header}>
            <Avatar name={displayName} uri={author?.avatarUrl} size={36} />
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={1}>
                {demo.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                @{author?.username ?? 'unknown'} · {formatDuration(demo.durationSec)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Badge label={demo.genre} />
            {showScore !== undefined ? (
              <Text style={styles.score}>{showScore} pts</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handlePlay} style={styles.actionBtn} hitSlop={8}>
            <SymbolView
              name={{
                ios: isActive ? 'pause.fill' : 'play.fill',
                android: isActive ? 'pause' : 'play_arrow',
                web: isActive ? 'pause' : 'play_arrow',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>
          <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={8}>
            <SymbolView
              name={{ ios: 'heart', android: 'favorite_border', web: 'favorite_border' }}
              size={18}
              tintColor={colors.textSecondary}
            />
            <Text style={styles.count}>{demo.likeCount}</Text>
          </Pressable>
          <Pressable onPress={handleRepost} style={styles.actionBtn} hitSlop={8}>
            <SymbolView
              name={{ ios: 'arrow.2.squarepath', android: 'refresh', web: 'refresh' }}
              size={18}
              tintColor={colors.textSecondary}
            />
            <Text style={styles.count}>{demo.repostCount}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  repostText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    fontFamily: fonts.mono,
    fontSize: 28,
    color: colors.text,
    fontWeight: '700',
    minWidth: 40,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.text,
  },
  artist: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  score: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 2,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
});
