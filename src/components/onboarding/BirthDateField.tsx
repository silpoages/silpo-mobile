import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Button from '@/components/Button';
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

const MAX_DATE = new Date();

/** Data de Nascimento (nó 4341:1911) — iOS não fecha o seletor nativo sozinho, por isso o modal com botão de confirmar. */
export function BirthDateField({ value, onChange, errorMessage }: BirthDateFieldProps) {
  const [text, setText] = useState(() => (value ? formatBirthDate(value) : ''));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(value ?? MAX_DATE);
  const hasError = Boolean(errorMessage);

  useEffect(() => {
    setText(value ? formatBirthDate(value) : '');
  }, [value]);

  function handleChangeText(raw: string) {
    const masked = maskBirthDateInput(raw);
    setText(masked);
    onChange(parseBirthDateInput(masked));
  }

  function handleOpenPicker() {
    setDraftDate(value ?? MAX_DATE);
    setIsPickerOpen(true);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setIsPickerOpen(false);

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  }

  function handleConfirm() {
    onChange(draftDate);
    setIsPickerOpen(false);
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

      {isPickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          maximumDate={MAX_DATE}
          mode="date"
          onChange={handleAndroidChange}
          value={draftDate}
        />
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
              display="inline"
              maximumDate={MAX_DATE}
              mode="date"
              onChange={(_event, selectedDate) => selectedDate && setDraftDate(selectedDate)}
              value={draftDate}
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
