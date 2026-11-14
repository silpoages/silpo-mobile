import { Image, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { colors, fontFamily, fontSize } from '@/theme';

/**
 * Tamanho pequeno pra caber ao lado do título — não reaproveita `BrandLogo`
 * porque ele tem uma margem negativa fixa (`-32`) calibrada só pro tamanho
 * grande da `WelcomeScreen`, que não faz sentido aqui.
 */
const logoSource = require('../../../assets/brand/silpo-logo.png');

type JourneyHeaderProps = {
  userName: string;
  onPressAvatar: () => void;
};

export function JourneyHeader({ userName, onPressAvatar }: JourneyHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Silpo"
        resizeMode="contain"
        source={logoSource}
        style={styles.logo}
      />
      <Text accessibilityRole="header" style={styles.title}>
        Minha jornada
      </Text>
      <ProfileAvatar userName={userName} onPress={onPressAvatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
});
