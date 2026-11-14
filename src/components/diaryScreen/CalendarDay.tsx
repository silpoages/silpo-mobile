import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDayLabel } from '@/features/diaryScreen/calendar';
import { colors, fontFamily, fontSize } from '@/theme';

type CalendarDayProps = {
  date: Date | null;
  isSelected: boolean;
  isToday: boolean;
  hasRecord: boolean;
  hasNote: boolean;
  onPress: (date: Date) => void;
};

export function CalendarDay({
  date,
  isSelected,
  isToday,
  hasRecord,
  hasNote,
  onPress,
}: CalendarDayProps) {
  if (date === null) {
    return <View style={styles.cell} />;
  }

  const accessibilityLabel = [
    formatDayLabel(date),
    isToday ? 'hoje' : null,
    hasRecord ? 'com registro' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={() => onPress(date)}
      style={styles.cell}
    >
      {({ pressed }) => (
        <View style={[styles.day, isSelected && styles.daySelected, pressed && styles.dayPressed]}>
          <Text
            style={[
              styles.dayNumber,
              hasNote && styles.dayNumberWithNote,
              isSelected && styles.dayNumberSelected,
            ]}
          >
            {date.getDate()}
          </Text>
          {hasRecord && !isSelected ? <View style={styles.dot} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    width: 40,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayPressed: {
    opacity: 0.6,
  },
  dayNumber: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.text,
  },
  dayNumberWithNote: {
    fontFamily: fontFamily.extraBold,
  },
  dayNumberSelected: {
    color: colors.textInverse,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
