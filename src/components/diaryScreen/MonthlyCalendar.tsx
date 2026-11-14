import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { CalendarDay } from '@/components/diaryScreen/CalendarDay';
import {
  WEEKDAY_INITIALS,
  buildMonthWeeks,
  formatMonthTitle,
  isSameDay,
  toDateKey,
  type CalendarMonth,
} from '@/features/diaryScreen/calendar';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type MonthlyCalendarProps = {
  month: CalendarMonth;
  selectedDate: Date;
  recordDates: ReadonlySet<string>;
  noteDates: ReadonlySet<string>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
};

export function MonthlyCalendar({
  month,
  selectedDate,
  recordDates,
  noteDates,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: MonthlyCalendarProps) {
  const today = new Date();
  const weeks = buildMonthWeeks(month);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.monthNavigation}>
          <Pressable
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            hitSlop={spacing.md}
            onPress={onPreviousMonth}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
          </Pressable>

          <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.title}>
            {formatMonthTitle(month)}
          </Text>

          <Pressable
            accessibilityLabel="Próximo mês"
            accessibilityRole="button"
            hitSlop={spacing.md}
            onPress={onNextMonth}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.legend} accessible accessibilityLabel="Ponto: dia com registro">
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>dia com registro</Text>
        </View>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.week}
      >
        {WEEKDAY_INITIALS.map((initial, index) => (
          <Text key={index} style={styles.weekday}>
            {initial}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((date, dayIndex) => {
            const dateKey = date ? toDateKey(date) : '';

            return (
              <CalendarDay
                key={dayIndex}
                date={date}
                isSelected={date !== null && isSameDay(date, selectedDate)}
                isToday={date !== null && isSameDay(date, today)}
                hasRecord={recordDates.has(dateKey)}
                hasNote={noteDates.has(dateKey)}
                onPress={onSelectDate}
              />
            );
          })}
        </View>
      ))}
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
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  pressed: {
    opacity: 0.5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  legendText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
