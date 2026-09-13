import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors } from '@/theme';

type CloseButtonProps = Omit<PressableProps, 'children'>;

/** Botão circular de fechar (X), usado no topo de telas apresentadas por cima do fluxo principal. */
export function CloseButton(props: CloseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Fechar"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      {...props}
    >
      <Feather name="x" size={21} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
