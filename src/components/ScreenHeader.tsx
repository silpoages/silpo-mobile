import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize } from '@/theme';

/**
 * Tamanho pequeno pra caber ao lado do título — não reaproveita `BrandLogo`
 * porque ele tem uma margem negativa fixa (`-32`) calibrada só pro tamanho
 * grande da `WelcomeScreen`, que não faz sentido aqui.
 */
const logoSource = require('../../assets/brand/silpo-logo.png');

/** Altura da linha do cabeçalho: a do `ProfileAvatar`, para o título não mudar de lugar sem ele. */
const HEADER_HEIGHT = 52;

type ScreenHeaderProps = {
  title: string;
  /** Ação à direita do título — em geral o `ProfileAvatar`. */
  right?: ReactNode;
};

/** Cabeçalho das abas (Diário, Minha jornada, Apoio): logo, título e ação, sempre na mesma posição. */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
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
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
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
