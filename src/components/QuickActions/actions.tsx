import type { ReactNode } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ActionProps {
  label: string;
  icon: ReactNode;
  time: string;
  onPress: () => void;
  isSelected?: boolean;
}

export function ActionButton({ label, icon, time, onPress, isSelected }: ActionProps) {
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
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 130,
    maxWidth: 130,
  },
  pressed: {
    backgroundColor: '#eef2ff',
    transform: [{ scale: 0.96 }],
  },
  selected: {
    backgroundColor: '#e0e7ff',
    borderColor: '#55685D',
    borderWidth: 2,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F3329',
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#55685D',
  },
  selectedLabel: {
    color: '#55685D',
    fontWeight: '700',
  },
});
