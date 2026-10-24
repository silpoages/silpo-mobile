import { View, Text, StyleSheet } from 'react-native';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/fonts';

type HeaderProps = {
  userName: string;
  subtitle: string;
  onPressAvatar?: () => void;
};

/** Saudação de acordo com o horário do dispositivo. */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Header({ userName, subtitle, onPressAvatar }: HeaderProps) {
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
      <ProfileAvatar userName={userName} onPress={onPressAvatar} />
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
});
