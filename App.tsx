import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components';
import { useAppFonts } from '@/hooks/useAppFonts';
import { colors, fontFamily, fontSize } from '@/theme';

export default function App() {
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Componentes Silpo</Text>
      <Text style={styles.subtitle}>Botoes reutilizaveis</Text>
      <View style={styles.examples}>
        <Button size="lg">Quero tentar</Button>
        <Button variant="secondary">Ver outras</Button>
        <Button
          leftIcon={<Text style={styles.supportIcon}>♡</Text>}
          variant="supportText"
          size="lg"
          shape="pill"
        >
          Apoio
        </Button>
        <Button variant="support" size="lg" shape="pill">
          Ver opcoes de apoio
        </Button>
        <Button variant="supportText" size="lg" shape="pill">
          Agora nao
        </Button>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    marginTop: 8,
  },
  examples: {
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  supportIcon: {
    color: colors.support.text,
    fontSize: fontSize.heading,
  },
});
