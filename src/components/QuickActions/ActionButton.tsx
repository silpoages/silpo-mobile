import type { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
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
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.label, isSelected ? styles.selectedLabel : undefined]}>{label}</Text>
      <Text style={[styles.time, isSelected ? styles.selectedLabel : undefined]}>{time}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.96 }],
  },
  selected: {
    borderColor: colors.textSecondary,
    borderWidth: 2,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.text,
  },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
  },
});
