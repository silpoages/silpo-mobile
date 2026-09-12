import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

type PauseButtonProps = {
  paused: boolean;
  onPress: () => void;
};

export default function PauseButton({ paused, onPress }: PauseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name={paused ? 'play' : 'pause'} size={21} color={colors.surface} stroke={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
