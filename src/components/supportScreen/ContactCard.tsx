import { Linking, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

export type ContactCardProps = {
  fullName: string;
  phoneNumber: string;
  subtitle?: string;
};

/** Card de um contato de apoio: avatar com a inicial do nome, nome e botão de ligar. */
export function ContactCard({
  fullName,
  phoneNumber,
  subtitle = 'sua pessoa de conforto',
}: ContactCardProps) {
  const initial = fullName.trim().charAt(0).toUpperCase();

  function handleCallPress() {
    Linking.openURL(`tel:${phoneNumber}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Button variant="support" shape="pill" onPress={handleCallPress}>
        Ligar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.support.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.title,
    color: colors.textInverse,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
