import type { ReactNode } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

export interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  time: string;
  onPress: () => void;
  isSelected?: boolean;
}

export function ActionButton({ label, icon, time, onPress, isSelected }: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        isSelected ? styles.selected : undefined,
        pressed ? styles.pressed : undefined,
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.label, isSelected ? styles.selectedLabel : undefined]}>{label}</Text>
      <Text style={[styles.time, isSelected ? styles.selectedLabel : undefined]}>{time}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 130,
    maxWidth: 130,
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
  label: {
    marginTop: 4,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.text,
  },
  time: {
    marginTop: 4,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
  },
});
