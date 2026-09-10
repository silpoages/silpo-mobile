import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import Button from '@/components/Button';
import { DecorativeCircle } from '@/components/icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, layout, spacing, typography } from '@/theme';
import { SupportPill } from '@/features/auth/components';

/**
 * Pré-login: apresenta a marca e leva ao cadastro ou ao acesso.
 *
 * Reproduz o frame `Welcome` (4346:11267) do Figma. O círculo decorativo sangra
 * pelo canto inferior direito, como no design.
 */
export function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View pointerEvents="none" style={styles.decoration}>
        <DecorativeCircle />
      </View>

      <View style={styles.header}>
        <SupportPill />
      </View>

      <View style={styles.hero}>
        <View style={styles.spaceAboveHero} />
        <BrandLogo />
        <Text style={styles.brand}>Silpo</Text>
        <Text style={styles.tagline}>Aquele que te ajuda a dar o primeiro passo.</Text>
        <View style={styles.spaceBelowHero} />
      </View>

      <View style={styles.actions}>
        <Button onPress={() => router.navigate('/cadastro')} size="lg" testID="start-button">
          Começar
        </Button>
        <Button
          onPress={() => router.navigate('/login')}
          size="lg"
          testID="sign-in-button"
          variant="secondary"
        >
          Já tenho uma conta
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  decoration: {
    bottom: -70,
    position: 'absolute',
    right: -120,
  },
  header: {
    paddingTop: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
  },
  /**
   * No Figma a marca não fica no centro da folga: sobra cerca de um terço acima
   * e três terços abaixo dela. Os dois espaçadores mantêm essa proporção em
   * qualquer altura de tela.
   */
  spaceAboveHero: {
    flex: 1,
  },
  spaceBelowHero: {
    flex: 3,
  },
  brand: {
    ...typography.brand,
    color: colors.text,
  },
  tagline: {
    ...typography.tagline,
    color: colors.textSecondary,
    marginTop: layout.heroGap,
    maxWidth: 280,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
