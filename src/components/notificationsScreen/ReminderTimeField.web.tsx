import { useRef, type ChangeEvent, type CSSProperties } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { formatReminderTime, type ReminderTime } from '@/features/notifications/reminderSettings';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type ReminderTimeFieldProps = {
  value: ReminderTime;
  onChange: (value: ReminderTime) => void;
  disabled?: boolean;
};

/** Input nativo com `showPicker()`, ainda não em todo `lib.dom.d.ts`. */
type InputWithPicker = HTMLInputElement & { showPicker?: () => void };

/** Variante web: o datetimepicker não roda no browser; a linha abre o seletor de hora do navegador. */
export function ReminderTimeField({ value, onChange, disabled }: ReminderTimeFieldProps) {
  const inputRef = useRef<InputWithPicker>(null);

  function handleOpen() {
    const input = inputRef.current;
    if (!input) return;
    if (input.showPicker) {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const [hour, minute] = event.target.value.split(':').map(Number);
    if (Number.isInteger(hour) && Number.isInteger(minute)) {
      onChange({ hour, minute });
    }
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

      <input
        aria-hidden="true"
        onChange={handleChange}
        ref={inputRef}
        style={hiddenInputStyle}
        tabIndex={-1}
        type="time"
        value={formatReminderTime(value)}
      />
    </View>
  );
}

/** Só guarda o valor e abre o `showPicker()` — não recebe clique nem foco por tab. */
const hiddenInputStyle: CSSProperties = {
  border: 'none',
  height: 0,
  opacity: 0,
  padding: 0,
  pointerEvents: 'none',
  position: 'absolute',
  width: 0,
};

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
});
