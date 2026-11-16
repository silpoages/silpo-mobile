import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EMOTIONS } from '@/components/emotions/emotionConfig';
import { useSession } from '@/features/auth/session/SessionContext';
import type { DiaryEntry } from '@/features/diaryScreen/diaryTypes';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  onDelete?: (entry: DiaryEntry) => void;
};

// No web, o <img> não envia o header Authorization (o react-native-web ignora
// `source.headers`), então a foto é baixada com o token e exibida via blob: URL.
function useWebAuthorizedImageUri(uri: string | null, token: string | null): string | null {
  // Guarda de qual uri/token o blob veio, para não exibir uma foto antiga ao trocar de entrada.
  const [loaded, setLoaded] = useState<{ key: string; blobUri: string } | null>(null);
  const key = `${uri}|${token}`;

  useEffect(() => {
    if (Platform.OS !== 'web' || uri === null || !uri.startsWith('http') || !token) return;

    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(uri, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (cancelled || blob === null) return;
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ key: `${uri}|${token}`, blobUri: objectUrl });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    };
  }, [uri, token]);

  return loaded?.key === key ? loaded.blobUri : null;
}

export function DiaryEntryCard({ entry, onDelete }: DiaryEntryCardProps) {
  const session = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const webPhotoUri = useWebAuthorizedImageUri(entry.photoUri, session.token);
  const photoSource =
    entry.photoUri === null
      ? null
      : !entry.photoUri.startsWith('http')
        ? { uri: entry.photoUri }
        : Platform.OS === 'web'
          ? webPhotoUri === null
            ? null
            : { uri: webPhotoUri }
          : {
              uri: entry.photoUri,
              headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
            };

  const emotion = EMOTIONS.find((item) => item.id === entry.mood);

  const hasActions = entry.note !== null && onDelete !== undefined;

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete?.(entry);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {emotion ? (
          <View style={styles.emotionIcon}>
            <MaterialCommunityIcons name={emotion.iconName} size={26} color={colors.primary} />
          </View>
        ) : null}

        <View style={styles.headerText}>
          {emotion ? <Text style={styles.emotionLabel}>{emotion.label}</Text> : null}
          <Text style={styles.subtitle}>Obrigado por registrar como você está se sentindo.</Text>
        </View>

        {hasActions ? (
          <Pressable
            accessibilityLabel="Mais ações do registro"
            accessibilityRole="button"
            accessibilityState={{ expanded: isMenuOpen }}
            hitSlop={spacing.md}
            onPress={() => setIsMenuOpen((isOpen) => !isOpen)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {isMenuOpen ? (
        <View style={styles.menu}>
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            <Text style={styles.menuItemDangerText}>Excluir registro</Text>
          </Pressable>
        </View>
      ) : null}

      {entry.note !== null ? <Text style={styles.note}>&quot;{entry.note}&quot;</Text> : null}

      {entry.practiceTitle !== null ? (
        <View style={styles.practice}>
          <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
          <Text style={styles.practiceText}>Prática: {entry.practiceTitle}</Text>
        </View>
      ) : null}

      {photoSource !== null ? (
        <Image accessibilityLabel="Foto do registro" source={photoSource} style={styles.photo} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emotionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  emotionLabel: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.5,
  },
  menu: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  menuItemDangerText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.danger,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: 22,
    color: colors.text,
  },
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  practiceText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
});
