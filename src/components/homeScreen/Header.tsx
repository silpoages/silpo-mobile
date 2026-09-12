import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/fonts';

type HeaderProps = {
  userName: string;
  subtitle: string;
};

/** Saudação de acordo com o horário do dispositivo. */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Header({ userName, subtitle }: HeaderProps) {
  const nameInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting} numberOfLines={3}>
          {getGreeting()}, {userName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={4}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{nameInitial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.surface,
  },
});
