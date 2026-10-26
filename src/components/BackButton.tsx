import { Pressable, StyleSheet } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { layout } from '@/theme';

type BackButtonProps = {
  onPress: () => void;
  testID?: string;
};

export function BackButton({ onPress, testID }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      testID={testID}
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
