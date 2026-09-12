import { Pressable, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/theme/colors';

export default function CloseButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Feather name={'x'} size={21} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
