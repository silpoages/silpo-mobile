import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

type MeditationHeaderProps = {
  title: string;
  subtitle: string;
  kicker?: string;
};

export function MeditationHeader({ title, subtitle, kicker }: MeditationHeaderProps) {
  return (
    <View>
      <View style={styles.textContainer}>
        {kicker && <Text style={styles.kicker}>{kicker}</Text>}
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    gap: 5,
    marginTop: 12,
    marginLeft: 15,
  },
  kicker: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.72,
    color: colors.primary,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.hero,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});
