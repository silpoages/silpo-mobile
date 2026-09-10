import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { colors, fontFamily, fontSize } from '@/theme';

export type ProfileIconName = keyof typeof Feather.glyphMap;

export type ProfileButtonProps = {
  title: string;
  icon: ProfileIconName | null;
  iconColor?: string;
  info?: string;
  onPress: () => void;
};

export default function ButtonProfile({
  title,
  icon,
  iconColor,
  info,
  onPress,
}: ProfileButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.left}>
          {icon && <Feather name={icon} size={19} color={iconColor ?? colors.textSecondary} />}

          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {info && <Text style={styles.info}>{info}</Text>}

          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    paddingHorizontal: 15,
    paddingVertical: 18,
    backgroundColor: colors.surface,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },

  info: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
