import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DemoCard } from '@/components/DemoCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { getUserDemos, getUserProfile, updateUserProfile } from '@/lib/demos';
import { Demo, UserProfile } from '@/lib/types';
import { colors, fonts, spacing } from '@/theme';

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const [userDemos, userProfile] = await Promise.all([
      getUserDemos(user.uid),
      getUserProfile(user.uid),
    ]);
    setDemos(userDemos);
    setLocalProfile(userProfile);
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setBio(userProfile.bio);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      await refreshProfile();
      setEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      Alert.alert('Error', message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const activeProfile = profile ?? localProfile;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          name={activeProfile?.displayName ?? 'U'}
          uri={activeProfile?.avatarUrl}
          size={72}
        />
        <View style={styles.headerMeta}>
          <Text style={styles.displayName}>{activeProfile?.displayName ?? '—'}</Text>
          <Text style={styles.username}>@{activeProfile?.username ?? 'unknown'}</Text>
          {!editing ? (
            <Text style={styles.bio}>{activeProfile?.bio || 'No bio yet.'}</Text>
          ) : (
            <View style={styles.editForm}>
              <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />
              <Input
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={styles.bioInput}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statValue}>{demos.length}</Text>
        <Text style={styles.statLabel}>DEMOS</Text>
      </View>

      <View style={styles.actions}>
        {editing ? (
          <>
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} />
          </>
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>Edit Profile</Text>
          </Pressable>
        )}
        <Button title="Sign Out" variant="secondary" onPress={handleSignOut} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR DEMOS</Text>
        {demos.length === 0 ? (
          <Text style={styles.empty}>No demos uploaded yet.</Text>
        ) : (
          demos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} author={activeProfile ?? undefined} onUpdate={loadProfile} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  displayName: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: colors.text,
  },
  username: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  bio: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  editForm: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statValue: {
    fontFamily: fonts.mono,
    fontSize: 24,
    color: colors.text,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  editLink: {
    fontFamily: fonts.sansMedium,
    color: colors.text,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: spacing.sm,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    padding: spacing.md,
    paddingBottom: 0,
  },
  empty: {
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    padding: spacing.md,
  },
});
