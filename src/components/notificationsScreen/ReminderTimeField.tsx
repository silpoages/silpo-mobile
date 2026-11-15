import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Button from '@/components/Button';
import { formatReminderTime, type ReminderTime } from '@/features/notifications/reminderSettings';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

type ReminderTimeFieldProps = {
  value: ReminderTime;
  onChange: (value: ReminderTime) => void;
  disabled?: boolean;
};

function toDate({ hour, minute }: ReminderTime): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function fromDate(date: Date): ReminderTime {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

/** Linha "Horário" — iOS não fecha o seletor nativo sozinho, por isso o modal com Confirmar. */
export function ReminderTimeField({ value, onChange, disabled }: ReminderTimeFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draft, setDraft] = useState(() => toDate(value));

  function handleOpen() {
    setDraft(toDate(value));
    setIsPickerOpen(true);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setIsPickerOpen(false);
    if (event.type === 'set' && selected) {
      onChange(fromDate(selected));
    }
  }

  function handleConfirm() {
    onChange(fromDate(draft));
    setIsPickerOpen(false);
  }

  return (
    <View>
      <Pressable
        accessibilityLabel={`Horário do lembrete: ${formatReminderTime(value)}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handleOpen}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Horário</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{formatReminderTime(value)}</Text>
          <MaterialCommunityIcons color={colors.textMuted} name="clock-outline" size={18} />
        </View>
      </Pressable>

      {isPickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker is24Hour mode="time" onChange={handleAndroidChange} value={draft} />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setIsPickerOpen(false)}
          transparent
          visible={isPickerOpen}
        >
          <Pressable
            accessibilityLabel="Fechar"
            onPress={() => setIsPickerOpen(false)}
            style={styles.backdrop}
          />
          <View style={styles.sheet}>
            <DateTimePicker
              display="spinner"
              locale="pt-BR"
              mode="time"
              onChange={(_event, selected) => selected && setDraft(selected)}
              value={draft}
            />
            <Button onPress={handleConfirm} size="lg">
              Confirmar
            </Button>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.text,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 51, 41, 0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.button + 4,
    borderTopRightRadius: radii.button + 4,
    bottom: 0,
    gap: spacing.lg,
    padding: spacing.xxl,
    position: 'absolute',
    width: '100%',
  },
});
