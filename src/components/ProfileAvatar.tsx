import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

type ProfileAvatarProps = {
  userName: string;
  onPress?: () => void;
};

/** Avatar com a inicial do usuário, que leva ao perfil. */
export function ProfileAvatar({ userName, onPress }: ProfileAvatarProps) {
  const nameInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      accessibilityLabel="Abrir perfil"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
    >
      <Text style={styles.initial}>{nameInitial}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  initial: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.surface,
  },
});
