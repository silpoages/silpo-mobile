import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  formatBirthDate,
  maskBirthDateInput,
  parseBirthDateInput,
} from '@/features/onboarding/date';
import { colors, layout, radii, spacing, typography } from '@/theme';

type BirthDateFieldProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  errorMessage?: string;
};

/** Input nativo com `showPicker()`, ainda não em todo `lib.dom.d.ts`. */
type InputWithPicker = HTMLInputElement & { showPicker?: () => void };

function toInputValue(date: Date | null): string {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Variante web: `@react-native-community/datetimepicker` não roda no browser, então o ícone só aciona `showPicker()` num input escondido. */
export function BirthDateField({ value, onChange, errorMessage }: BirthDateFieldProps) {
  const inputRef = useRef<InputWithPicker>(null);
  const [text, setText] = useState(() => (value ? formatBirthDate(value) : ''));
  const hasError = Boolean(errorMessage);

  useEffect(() => {
    setText(value ? formatBirthDate(value) : '');
  }, [value]);

  function handleChangeText(raw: string) {
    const masked = maskBirthDateInput(raw);
    setText(masked);
    onChange(parseBirthDateInput(masked));
  }

  function handleNativeInputChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;

    if (!raw) {
      return;
    }

    const [year, month, day] = raw.split('-').map(Number);
    onChange(new Date(year, month - 1, day));
  }

  function handleOpenPicker() {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (input.showPicker) {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.field, hasError && styles.fieldError]}>
        <TextInput
          accessibilityLabel="Data de nascimento"
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handleChangeText}
          placeholder="Data de Nascimento"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          testID="birth-date-field"
          value={text}
        />

        <Pressable
          accessibilityLabel="Abrir calendário"
          accessibilityRole="button"
          hitSlop={spacing.md}
          onPress={handleOpenPicker}
          testID="birth-date-calendar-button"
        >
          <MaterialCommunityIcons
            color={colors.textMuted}
            name="calendar-blank-outline"
            size={20}
          />
        </Pressable>
      </View>

      {hasError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <input
        aria-hidden="true"
        max={toInputValue(new Date())}
        onChange={handleNativeInputChange}
        ref={inputRef}
        style={hiddenInputStyle}
        tabIndex={-1}
        type="date"
        value={toInputValue(value)}
      />
    </View>
  );
}

/** Só existe pra guardar o valor e abrir o `showPicker()` — não recebe clique nem foco por tab. */
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
  container: {
    gap: 6,
    width: '100%',
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.field,
    borderWidth: layout.borderWidth,
    flexDirection: 'row',
    height: layout.fieldHeight,
    justifyContent: 'space-between',
    paddingHorizontal: layout.fieldPaddingHorizontal,
    width: '100%',
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    ...typography.input,
    color: colors.text,
    flex: 1,
    height: '100%',
  },
  error: {
    ...typography.footnote,
    color: colors.danger,
  },
});
