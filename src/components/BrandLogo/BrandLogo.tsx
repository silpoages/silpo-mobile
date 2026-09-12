import { Image, StyleSheet } from 'react-native';

import { layout } from '@/theme';

/** Símbolo do Silpo exportado do nó 4346:11265 do Figma. */
const logoSource = require('../../../assets/brand/silpo-logo.png');

type BrandLogoProps = {
  size?: number;
};

export function BrandLogo({ size = layout.logoSize }: BrandLogoProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Silpo"
      resizeMode="contain"
      source={logoSource}
      style={[styles.logo, { height: size, width: size }]}
    />
  );
}

const styles = StyleSheet.create({
  /**
   * O PNG exportado tem margem transparente embaixo. Sem essa compensação, a
   * distância entre o símbolo e a palavra "Silpo" fica bem maior que no design.
   */
  logo: {
    marginBottom: -32,
  },
});
