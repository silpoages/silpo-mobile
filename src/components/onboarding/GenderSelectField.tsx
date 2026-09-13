import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { GENDER_OPTIONS, type Gender } from '@/services/user';
import { colors, fontFamily, fontSize, layout, radii, typography } from '@/theme';

type GenderSelectFieldProps = {
  value: Gender | null;
  onChange: (value: Gender) => void;
  errorMessage?: string;
};

/** Campo "Seu gênero": abre uma lista de opções, como o dropdown do nó 4341:1914. */
export function GenderSelectField({ value, onChange, errorMessage }: GenderSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = GENDER_OPTIONS.find((option) => option.value === value);
  const hasError = Boolean(errorMessage);

  function handleSelect(option: Gender) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Seu gênero"
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={[styles.field, hasError && styles.fieldError]}
        testID="gender-field"
      >
        <Text style={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption?.label ?? 'Seu gênero'}
        </Text>
        <MaterialCommunityIcons color={colors.textMuted} name="chevron-down" size={20} />
      </Pressable>

      {hasError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <Pressable
          accessibilityLabel="Fechar"
          onPress={() => setIsOpen(false)}
          style={styles.backdrop}
        />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Seu gênero</Text>

          {GENDER_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              onPress={() => handleSelect(option.value)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <Text
                style={option.value === value ? styles.optionLabelSelected : styles.optionLabel}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>
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
  placeholder: {
    ...typography.input,
    color: colors.textMuted,
  },
  value: {
    ...typography.input,
    color: colors.text,
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
    gap: 4,
    padding: 20,
    position: 'absolute',
    width: '100%',
  },
  sheetTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    marginBottom: 8,
  },
  option: {
    borderRadius: radii.field,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionLabel: {
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
});
