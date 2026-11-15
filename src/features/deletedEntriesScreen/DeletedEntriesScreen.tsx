import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { BackButton } from '@/components/BackButton';
import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { EMOTIONS } from '@/components/emotions/emotionConfig';
import { useSession } from '@/features/auth/session/SessionContext';
import { formatDiaryDate } from '@/features/diary/diaryDate';
import {
  listDeletedDiaryEntries,
  restoreDiaryEntry,
  type DeletedDiaryEntry,
} from '@/features/diaryScreen/diaryService';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

/** `AAAA-MM-DD` da API como data local (sem fuso), para não cair no dia anterior. */
function parseEntryDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDeletedAt(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function DeletedEntriesScreen() {
  const router = useRouter();
  const session = useSession();
  const token = session.token;
  const [entries, setEntries] = useState<DeletedDiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    listDeletedDiaryEntries(token)
      .then((items) => {
        if (cancelled) return;
        setEntries(items);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/perfil');
    }
  }

  function handleRetry() {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function handleRestore(entry: DeletedDiaryEntry) {
    if (!token || restoringId) return;
    setRestoringId(entry.id);
    setFeedback(null);

    try {
      await restoreDiaryEntry(token, entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      setFeedback({
        kind: 'success',
        text: 'Registro restaurado. Ele já está de volta no diário.',
      });
    } catch {
      setFeedback({ kind: 'error', text: 'Não foi possível restaurar agora. Tente novamente.' });
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      <StatusBar style="dark" />

      <View>
        <BackButton onPress={handleBack} />
        <View style={styles.titleContainer}>
          <Text accessibilityRole="header" style={styles.title}>
            Mensagens apagadas
          </Text>
          <Text style={styles.subtitle}>
            Registros do diário que você apagou. Restaure para que voltem ao diário.
          </Text>
        </View>
      </View>

      {feedback ? (
        <Text
          accessibilityRole="alert"
          style={[styles.feedback, feedback.kind === 'error' && styles.feedbackError]}
        >
          {feedback.text}
        </Text>
      ) : null}

      {isLoading ? (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : loadFailed ? (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Não foi possível carregar os registros apagados.</Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          <Button variant="secondary" onPress={handleRetry}>
            Tentar novamente
          </Button>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centerFeedback}>
          <MaterialCommunityIcons color={colors.textMuted} name="delete-empty-outline" size={40} />
          <Text style={styles.feedbackTitle}>Nenhum registro apagado</Text>
          <Text style={styles.feedbackSubtitle}>
            Quando você apagar um registro do diário, ele aparece aqui.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <DeletedEntryCard
              key={entry.id}
              entry={entry}
              isRestoring={restoringId === entry.id}
              disabled={restoringId !== null}
              onRestore={() => handleRestore(entry)}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

type DeletedEntryCardProps = {
  entry: DeletedDiaryEntry;
  isRestoring: boolean;
  disabled: boolean;
  onRestore: () => void;
};

function DeletedEntryCard({ entry, isRestoring, disabled, onRestore }: DeletedEntryCardProps) {
  const emotion = EMOTIONS.find((item) => item.id === entry.mood);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {emotion ? (
          <View style={styles.emotionIcon}>
            <MaterialCommunityIcons color={colors.primary} name={emotion.iconName} size={22} />
          </View>
        ) : null}
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardDate}>{formatDiaryDate(parseEntryDate(entry.date))}</Text>
          <Text style={styles.cardMeta}>
            {emotion ? `${emotion.label} · ` : ''}Apagado em {formatDeletedAt(entry.deletedAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>&quot;{entry.note}&quot;</Text>

      {entry.practiceTitle ? (
        <Text style={styles.cardMeta}>Prática: {entry.practiceTitle}</Text>
      ) : null}

      {entry.hadPhoto ? (
        <Text style={styles.photoNote}>A foto deste registro foi apagada e não volta.</Text>
      ) : null}

      <Button
        variant="secondary"
        size="sm"
        loading={isRestoring}
        disabled={disabled}
        onPress={onRestore}
        accessibilityLabel={`Restaurar registro de ${formatDiaryDate(parseEntryDate(entry.date))}`}
      >
        Restaurar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: '100%',
    paddingHorizontal: 20,
    gap: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  titleContainer: {
    gap: 5,
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  centerFeedback: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  feedbackTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  feedback: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.primary,
    textAlign: 'center',
  },
  feedbackError: {
    color: colors.danger,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardDate: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.text,
  },
  cardMeta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: 22,
    color: colors.text,
  },
  photoNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
