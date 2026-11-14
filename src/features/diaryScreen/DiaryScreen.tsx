import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import Button from '@/components/Button';
import { DiaryEmptyState } from '@/components/diaryScreen/DiaryEmptyState';
import { DiaryEntryCard } from '@/components/diaryScreen/DiaryEntryCard';
import { DiaryHeader } from '@/components/diaryScreen/DiaryHeader';
import { MonthlyCalendar } from '@/components/diaryScreen/MonthlyCalendar';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  addMonths,
  getDefaultSelectedDate,
  getMonthOf,
  toDateKey,
  type CalendarMonth,
} from './calendar';
import type { DiaryEntry } from './diaryTypes';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type DiaryScreenProps = {
  entries: DiaryEntry[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onMonthChange?: (month: CalendarMonth) => void;
  onAddEntry?: (date: Date) => void;
  onDeleteEntry?: (entry: DiaryEntry) => void;
};

export function DiaryScreen({
  entries,
  isLoading = false,
  hasError = false,
  onRetry,
  onMonthChange,
  onAddEntry,
  onDeleteEntry,
}: DiaryScreenProps) {
  const router = useRouter();
  const session = useSession();
  const userName = session.user?.fullName?.trim() || session.user?.email || '';

  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(() => getMonthOf(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const recordDates = new Set(entries.map((entry) => entry.date));
  const noteDates = new Set(
    entries.filter((entry) => entry.note !== null).map((entry) => entry.date),
  );
  const selectedDateKey = toDateKey(selectedDate);
  const selectedEntries = entries.filter((entry) => entry.date === selectedDateKey);
  const isSelectedDayEmpty = !isLoading && !hasError && selectedEntries.length === 0;

  function handleChangeMonth(amount: number) {
    const nextMonth = addMonths(visibleMonth, amount);

    setVisibleMonth(nextMonth);
    setSelectedDate(getDefaultSelectedDate(nextMonth));
    onMonthChange?.(nextMonth);
  }

  function handleAddEntry() {
    onAddEntry?.(selectedDate);
  }

  function renderEntries() {
    if (isLoading) {
      return (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackSubtitle}>Carregando seus registros...</Text>
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={styles.feedback}>
          <Text accessibilityRole="alert" style={styles.feedbackTitle}>
            Não foi possível carregar seus registros
          </Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={spacing.md}
              onPress={onRetry}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar de novo</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    if (isSelectedDayEmpty) {
      return <DiaryEmptyState onCreateEntry={handleAddEntry} />;
    }

    return selectedEntries.map((entry) => (
      <DiaryEntryCard key={entry.id} entry={entry} onDelete={onDeleteEntry} />
    ));
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <DiaryHeader onPressAvatar={() => router.push('/perfil')} userName={userName} />

        <MonthlyCalendar
          month={visibleMonth}
          selectedDate={selectedDate}
          recordDates={recordDates}
          noteDates={noteDates}
          onPreviousMonth={() => handleChangeMonth(-1)}
          onNextMonth={() => handleChangeMonth(1)}
          onSelectDate={setSelectedDate}
        />

        {renderEntries()}
      </ScrollView>

      {isSelectedDayEmpty ? null : (
        <View style={styles.footer}>
          <Button
            leftIcon={<MaterialCommunityIcons name="plus" size={20} color={colors.textInverse} />}
            onPress={handleAddEntry}
            size="lg"
          >
            Adicionar registro
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  feedback: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
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
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
