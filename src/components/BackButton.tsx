import { Pressable, StyleSheet } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { layout } from '@/theme';

type BackButtonProps = {
  onPress: () => void;
};

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ChevronLeftIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.backButtonSize,
    height: layout.backButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
