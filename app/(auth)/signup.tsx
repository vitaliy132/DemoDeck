import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUp } from '@/lib/auth';
import { colors, fonts, spacing } from '@/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'dj' | 'raver'>('dj');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username || !displayName) {
      Alert.alert('Missing fields', 'Fill in all fields.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      Alert.alert('Invalid username', 'Use lowercase letters, numbers, and underscores only.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim(), displayName.trim(), role);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>JOIN THE OFFICE</Text>
            <Text style={styles.tagline}>Choose your role and join the scene.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="DJ Name"
            />
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="djname"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@email.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min 6 characters"
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>I want to sign up as</Text>
              <View style={styles.roleOptions}>
                <Pressable
                  style={[styles.roleOption, role === 'dj' && styles.roleOptionActive]}
                  onPress={() => setRole('dj')}>
                  <Text style={[styles.roleText, role === 'dj' && styles.roleTextActive]}>Artist</Text>
                  <Text style={styles.roleHint}>Can upload and share demos</Text>
                </Pressable>
                <Pressable
                  style={[styles.roleOption, role === 'raver' && styles.roleOptionActive]}
                  onPress={() => setRole('raver')}>
                  <Text style={[styles.roleText, role === 'raver' && styles.roleTextActive]}>Raver</Text>
                  <Text style={styles.roleHint}>Can discover and follow the scene</Text>
                </Pressable>
              </View>
            </View>

            <Button title="Create Account" onPress={handleSignUp} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  logo: {
    fontFamily: fonts.mono,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 3,
    fontWeight: '700',
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  roleSection: {
    gap: spacing.sm,
  },
  roleLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
  },
  roleOptions: {
    gap: spacing.sm,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  roleOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '14',
  },
  roleText: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleTextActive: {
    color: colors.accent,
  },
  roleHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    fontFamily: fonts.sansMedium,
    color: colors.text,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
