import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { AudioPlayer } from '@/components/AudioPlayer';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import {
  getDemo,
  getUserProfile,
  hasReposted,
  incrementPlayCount,
  isDemoLiked,
  repostDemo,
  toggleLike,
} from '@/lib/demos';
import { Demo, UserProfile } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

export default function DemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [demo, setDemo] = useState<Demo | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDemo = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getDemo(id);
      setDemo(data);
      if (data) {
        const profile = await getUserProfile(data.userId);
        setAuthor(profile);
        if (user) {
          const [isLiked, hasRep] = await Promise.all([
            isDemoLiked(id, user.uid),
            hasReposted(user.uid, id),
          ]);
          setLiked(isLiked);
          setReposted(hasRep);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadDemo();
  }, [loadDemo]);

  const handleLike = async () => {
    if (!user || !demo) return;
    await toggleLike(demo.id, user.uid, liked);
    setLiked(!liked);
    setDemo({ ...demo, likeCount: demo.likeCount + (liked ? -1 : 1) });
  };

  const handleRepost = async () => {
    if (!user || !demo) return;
    if (reposted) {
      Alert.alert('Already reposted', 'You have already reposted this demo.');
      return;
    }
    await repostDemo(user.uid, demo.id);
    setReposted(true);
    setDemo({ ...demo, repostCount: demo.repostCount + 1 });
    Alert.alert('Reposted', 'Demo added to the feed.');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!demo) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Demo not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={22} tintColor={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {demo.coverUrl ? (
          <Image source={{ uri: demo.coverUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <SymbolView name={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }} size={48} tintColor={colors.textMuted} />
          </View>
        )}

        <Text style={styles.title}>{demo.title}</Text>

        <View style={styles.authorRow}>
          <Avatar name={author?.displayName ?? '?'} uri={author?.avatarUrl} size={32} />
          <Text style={styles.authorName}>@{author?.username ?? 'unknown'}</Text>
          <Badge label={demo.genre} />
        </View>

        <AudioPlayer
          demoId={demo.id}
          audioUrl={demo.audioUrl}
          onPlayCount={() => incrementPlayCount(demo.id)}
          full
        />

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{demo.likeCount}</Text>
            <Text style={styles.statLabel}>LIKES</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{demo.repostCount}</Text>
            <Text style={styles.statLabel}>REPOSTS</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{demo.playCount}</Text>
            <Text style={styles.statLabel}>PLAYS</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <SymbolView
              name={{ ios: liked ? 'heart.fill' : 'heart', android: 'favorite', web: 'favorite' }}
              size={22}
              tintColor={liked ? colors.text : colors.textSecondary}
            />
            <Text style={styles.actionText}>{liked ? 'Liked' : 'Like'}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleRepost}>
            <SymbolView name={{ ios: 'arrow.2.squarepath', android: 'refresh', web: 'refresh' }} size={22} tintColor={reposted ? colors.textMuted : colors.textSecondary} />
            <Text style={styles.actionText}>{reposted ? 'Reposted' : 'Repost'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontFamily: fonts.sans,
    color: colors.textSecondary,
  },
  nav: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  coverPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: colors.text,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorName: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNum: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.text,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  actionText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
