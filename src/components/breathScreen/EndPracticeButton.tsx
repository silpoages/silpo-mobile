import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme';

type EndPracticeButtonProps = {
  onPress: () => void;
};

export default function EndPracticeButton({ onPress }: EndPracticeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={styles.label}>Encerrar Prática</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.primaryDark,
  },
});
