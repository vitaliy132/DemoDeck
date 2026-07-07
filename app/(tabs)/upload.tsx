import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { createDemo, formatDuration } from '@/lib/demos';
import { uploadAudio, uploadCoverImage } from '@/lib/storage';
import { colors, fonts, radius, spacing } from '@/theme';

const GENRES = ['House', 'Techno', 'DnB', 'Dubstep', 'Trance', 'Hip-Hop', 'Other'];

export default function UploadScreen() {
  const { user, profile } = useAuth();
  const isDJ = profile?.role === 'dj';
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string; durationSec: number } | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    let durationSec = 0;

    try {
      const { sound, status } = await Audio.Sound.createAsync({ uri: asset.uri });
      if (status.isLoaded && status.durationMillis) {
        durationSec = Math.round(status.durationMillis / 1000);
      }
      await sound.unloadAsync();
    } catch {
      durationSec = 0;
    }

    setAudioFile({
      uri: asset.uri,
      name: asset.name,
      durationSec,
    });
  };

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!isDJ) {
      Alert.alert('Access denied', 'Only DJs can publish demos.');
      return;
    }

    if (!user || !audioFile || !title.trim()) {
      Alert.alert('Missing info', 'Select an audio file and enter a title.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const audioUrl = await uploadAudio(user.uid, audioFile.uri, audioFile.name, setProgress);

      let coverUrl: string | undefined;
      if (coverUri) {
        coverUrl = await uploadCoverImage(user.uid, coverUri, 'cover.jpg');
      }

      await createDemo({
        userId: user.uid,
        title: title.trim(),
        genre,
        audioUrl,
        coverUrl,
        durationSec: audioFile.durationSec,
      });

      Alert.alert('Published', 'Your demo is live on the deck.');
      setTitle('');
      setAudioFile(null);
      setCoverUri(null);
      setProgress(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      Alert.alert('Error', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>NEW DEMO</Text>

      {isDJ ? (
        <>
          <Button
            title={audioFile ? 'Change Audio File' : 'Select Audio File'}
            variant="secondary"
            onPress={pickAudio}
          />

          {audioFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{audioFile.name}</Text>
              <Text style={styles.fileMeta}>{formatDuration(audioFile.durationSec)}</Text>
            </View>
          ) : null}

          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Track title" />

          <View style={styles.genreSection}>
            <Text style={styles.genreLabel}>GENRE</Text>
            <View style={styles.genreGrid}>
              {GENRES.map((g) => (
                <Text
                  key={g}
                  onPress={() => setGenre(g)}
                  style={[styles.genreChip, genre === g && styles.genreChipActive]}>
                  {g}
                </Text>
              ))}
            </View>
          </View>

          <Button
            title={coverUri ? 'Change Cover Art' : 'Add Cover Art (Optional)'}
            variant="ghost"
            onPress={pickCover}
          />

          {uploading ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          ) : null}

          <Button title="Publish Demo" onPress={handlePublish} loading={uploading} disabled={!audioFile} />
        </>
      ) : (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>DJ access only</Text>
          <Text style={styles.noticeText}>
            Only DJs can publish demos. Create a DJ account to share your tracks with the community.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  fileInfo: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  fileName: {
    fontFamily: fonts.sansMedium,
    color: colors.text,
    fontSize: 14,
  },
  fileMeta: {
    fontFamily: fonts.mono,
    color: colors.textSecondary,
    fontSize: 11,
  },
  genreSection: {
    gap: spacing.sm,
  },
  genreLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  genreChipActive: {
    color: colors.background,
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  notice: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  noticeTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.text,
  },
  noticeText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
