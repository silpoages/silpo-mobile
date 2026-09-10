import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize } from '@/theme';

export default function ButtonExamplesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Componentes Silpo</Text>
      <Text style={styles.subtitle}>Botões reutilizáveis</Text>
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
          Ver opções de apoio
        </Button>
        <Button variant="supportText" size="lg" shape="pill">
          Agora não
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 116,
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
