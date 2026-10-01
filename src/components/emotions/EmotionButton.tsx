import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

export interface EmotionButtonProps {
  label: string;
  emoji: ReactNode;
  onPress: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function EmotionButton({ label, emoji, onPress, isSelected, disabled }: EmotionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isSelected ? styles.selected : undefined,
        disabled && !isSelected ? styles.disabled : undefined,
        pressed ? styles.pressed : undefined,
      ]}
      onPress={onPress}
    >
      {emoji}
      <Text style={[styles.label, isSelected ? styles.selectedLabel : undefined]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    maxWidth: 80,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.96 }],
  },
  selected: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.textSecondary,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginTop: 4,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
  },
});
