import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { DiaryEntryBottomSheet } from '@/features/diary/components/DiaryEntryBottomSheet';
import type { DiaryEntryDraft } from '@/features/diary/components/DiaryEntryBottomSheet';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  getDiaryCalendar,
  listDiaryEntries,
  listMoodLogs,
  uploadDiaryImage,
  type DiaryDay,
} from '@/features/diaryScreen/diaryService';
import { DiaryScreen } from '@/features/diaryScreen/DiaryScreen';
import type { DiaryEntry } from '@/features/diaryScreen/diaryTypes';
import { toDateKey, type CalendarMonth } from '@/features/diaryScreen/calendar';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

function monthKey(month: CalendarMonth) {
  return `${month.year}-${String(month.month + 1).padStart(2, '0')}`;
}

function monthBounds(month: CalendarMonth) {
  const start = `${monthKey(month)}-01`;
  const lastDay = new Date(month.year, month.month + 1, 0).getDate();
  const end = `${monthKey(month)}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

function markerEntry(day: DiaryDay): DiaryEntry {
  return {
    id: `marker-${day.date}`,
    date: day.date,
    mood: day.moods[0] ?? null,
    note: null,
    photoUri: null,
    practiceTitle: null,
  };
}

export default function DiaryRoute() {
  const session = useSession();
  const [month, setMonth] = useState<CalendarMonth>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [sheetDate, setSheetDate] = useState<Date | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DiaryEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Entra na lista de dependências para buscar de novo depois de salvar ou excluir.
      void reloadKey;

      void (async () => {
        if (!session.token) {
          if (!active) return;
          setEntries([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setHasError(false);
        const bounds = monthBounds(month);
        const selectedKey = toDateKey(selectedDate);

        try {
          const [days, monthEntries, moodLogs] = await Promise.all([
            getDiaryCalendar(session.token, monthKey(month)),
            listDiaryEntries(session.token, bounds.start, bounds.end),
            listMoodLogs(session.token, selectedKey),
          ]);
          if (!active) return;
          const linkedMoodIds = new Set(
            monthEntries.map((entry) => entry.moodLogId).filter((id): id is string => id !== null),
          );
          const moodCards: DiaryEntry[] = moodLogs
            .filter((log) => !linkedMoodIds.has(log.id))
            .map((log) => ({
              id: `mood-${log.id}`,
              date: selectedKey,
              mood: log.mood,
              note: null,
              photoUri: null,
              practiceTitle: null,
            }));
          const coveredDates = new Set(monthEntries.map((entry) => entry.date));
          if (moodCards.length > 0) coveredDates.add(selectedKey);
          const markers = days
            .filter(
              (day) =>
                !coveredDates.has(day.date) && (day.entriesCount > 0 || day.moods.length > 0),
            )
            .map(markerEntry);

          setEntries([...monthEntries, ...moodCards, ...markers]);
        } catch {
          if (active) setHasError(true);
        } finally {
          if (active) setIsLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [month, reloadKey, selectedDate, session.token]),
  );

  async function handleSave(draft: DiaryEntryDraft) {
    if (!session.token) {
      throw new Error('Sessão expirada');
    }

    const imageUrl = draft.photoUri ? await uploadDiaryImage(session.token, draft.photoUri) : null;
    await createDiaryEntry(session.token, {
      note: draft.note,
      entryDate: draft.entry_date,
      mood: draft.mood,
      imageUrl,
    });
    setReloadKey((key) => key + 1);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !session.token || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDiaryEntry(session.token, pendingDelete.id);
      setPendingDelete(null);
      setReloadKey((key) => key + 1);
    } catch {
      setDeleteError('Não foi possível excluir. O registro continua aqui.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DiaryScreen
        entries={entries}
        isLoading={isLoading}
        hasError={hasError}
        onRetry={() => setReloadKey((key) => key + 1)}
        onMonthChange={setMonth}
        onSelectDate={setSelectedDate}
        onAddEntry={(date) => setSheetDate(date)}
        onDeleteEntry={(entry) => {
          setDeleteError(null);
          setPendingDelete(entry);
        }}
      />
      <DiaryEntryBottomSheet
        visible={sheetDate !== null}
        entryDate={sheetDate ?? selectedDate}
        onClose={() => setSheetDate(null)}
        onSave={handleSave}
      />
      <Modal
        transparent
        visible={pendingDelete !== null}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Excluir registro?</Text>
            <Text style={styles.dialogMessage}>
              O relato sai do diário. A emoção do dia permanece.
            </Text>
            {deleteError ? <Text style={styles.dialogError}>{deleteError}</Text> : null}
            <View style={styles.dialogActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={() => setPendingDelete(null)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={() => void handleConfirmDelete()}
              >
                <Text style={styles.deleteText}>{isDeleting ? 'Excluindo...' : 'Excluir'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(31, 51, 41, 0.25)',
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.md,
  },
  dialogTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.text,
  },
  dialogMessage: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  dialogError: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xl,
  },
  cancelText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  deleteText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.danger,
  },
});
