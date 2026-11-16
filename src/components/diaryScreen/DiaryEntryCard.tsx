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

// Monta a data: URI em pedaços: `String.fromCharCode(...bytes)` de uma vez estoura a pilha
// em fotos maiores.
function toDataUri(buffer: ArrayBuffer, contentType: string): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let start = 0; start < bytes.length; start += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(start, start + chunkSize));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

// A rota da foto exige o token, mas o <Image> não o envia: no web o react-native-web ignora
// `source.headers`, e no Android (RN 0.86) a requisição chega à API sem o Authorization (401).
// Então a foto é baixada com fetch, que envia o token e segue o redirect da API para a URL
// assinada do S3, e exibida via blob: URL (web) ou data: URI (Android/iOS).
function useAuthorizedImageUri(uri: string | null, token: string | null): string | null {
  // Guarda de qual uri/token a imagem veio, para não exibir uma foto antiga ao trocar de entrada.
  const [loaded, setLoaded] = useState<{ key: string; imageUri: string } | null>(null);
  const key = `${uri}|${token}`;

  useEffect(() => {
    if (uri === null || !uri.startsWith('http') || !token) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    async function load(imageUri: string, authToken: string) {
      const response = await fetch(imageUri, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok || cancelled) return;

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ key: `${imageUri}|${authToken}`, imageUri: objectUrl });
        return;
      }

      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      const buffer = await response.arrayBuffer();
      if (cancelled) return;
      setLoaded({ key: `${imageUri}|${authToken}`, imageUri: toDataUri(buffer, contentType) });
    }

    load(uri, token).catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    };
  }, [uri, token]);

  return loaded?.key === key ? loaded.imageUri : null;
}

export function DiaryEntryCard({ entry, onDelete }: DiaryEntryCardProps) {
  const session = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authorizedPhotoUri = useAuthorizedImageUri(entry.photoUri, session.token);
  const photoSource =
    entry.photoUri === null
      ? null
      : !entry.photoUri.startsWith('http')
        ? { uri: entry.photoUri }
        : authorizedPhotoUri === null
          ? null
          : { uri: authorizedPhotoUri };

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
