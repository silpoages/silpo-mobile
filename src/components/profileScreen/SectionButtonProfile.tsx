import { View, Text, StyleSheet } from 'react-native';
import ButtonProfile from '@/components/profileScreen/ButtonProfile';
import type { ProfileButtonProps } from '@/components/profileScreen/ButtonProfile';
import { colors, fontFamily, fontSize } from '@/theme';

type SectionButtonProfileProps = {
  title: string;
  items: ProfileButtonProps[];
};

export default function SectionButtonProfile({ title, items }: SectionButtonProfileProps) {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <View style={styles.section}>
        {items.map((item) => (
          <ButtonProfile key={item.title} {...item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  section: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: 1,

    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.sm,
    letterSpacing: 0.72,
    color: colors.textSecondary,
  },
});
