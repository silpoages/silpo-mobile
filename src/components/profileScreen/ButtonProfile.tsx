import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

type ProfileButtonProps = {
  title: string;
  icon: ImageSourcePropType | null;
  info?: string;
  action: () => void;
};

const iconArrow = require('../../../assets/profileScreen/icon-arrow.svg');

export default function ButtonProfile({ title, icon, info, action }: ProfileButtonProps) {
  return (
    <Pressable style={styles.button} onPress={action}>
      <View style={styles.content}>
        <View style={styles.left}>
          {icon && <Image source={icon} style={styles.icon} />}

          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {info && <Text style={styles.info}>{info}</Text>}

          <Image source={iconArrow} style={styles.arrow} />
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

  icon: {
    width: 22,
    height: 22,
  },

  arrow: {
    width: 18,
    height: 18,
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
