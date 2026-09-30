import { StyleSheet, ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors, fontFamily, fontSize } from '@/theme';
import { Header } from '@/components/practicesScreen/Header';
import { PracticeCard, Practice } from '@/components/practicesScreen/PracticeCard';

type ScreenState = 'loading' | 'error' | 'empty' | 'success';

/** Fixo em `success` até a lista vir do backend; os demais estados já têm tela. */
const SCREEN_STATE = 'success' as ScreenState;

const MOCK_PRACTICES: Practice[] = [
  {
    id: '1',
    title: 'Sentar em um parque',
    description:
      'Escolha um banco tranquilo e fique o tempo que for confortável. Só isso já conta.',
  },
  {
    id: '2',
    title: 'Tomar um café em uma cafeteria',
    description:
      'Vá sozinho ou com alguém de confiança por perto. Peça o de sempre, sente-se e fique um pouco.',
  },
  {
    id: '3',
    title: 'Ir ao supermercado',
    description:
      'Leve uma lista curta. Comece pelo horário mais tranquilo, se ajudar. Um item já é uma vitória.',
  },
  {
    id: '4',
    title: 'Pegar um transporte público',
    description:
      'Um trajeto pequeno e conhecido. Ônibus, metrô ou app — o que for mais confortável pra você.',
  },
  {
    id: '5',
    title: 'Passar um tempo em uma biblioteca',
    description:
      'Um lugar público, mas silencioso. Escolha um livro, sente-se e fique o tempo que quiser.',
  },
];

export function PracticesScreen() {
  const router = useRouter();
  const practices = SCREEN_STATE === 'success' ? MOCK_PRACTICES : [];

  function handlePracticePress() {
    router.push('/praticas-do-bem');
  }
  function handleRetry() {
    // TODO: buscar as práticas de novo
  }
  function renderContent() {
    if (SCREEN_STATE === 'loading') {
      return (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackSubtitle}>Carregando práticas...</Text>
        </View>
      );
    }
    if (SCREEN_STATE === 'error') {
      return (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Não foi possível carregar as práticas</Text>
          <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
          <Pressable onPress={handleRetry} hitSlop={8} accessibilityRole="button">
            <Text style={styles.retryText}>Tentar de novo</Text>
          </Pressable>
        </View>
      );
    }
    if (practices.length === 0) {
      return (
        <View style={styles.centerFeedback}>
          <Text style={styles.feedbackTitle}>Nenhuma prática disponível</Text>
          <Text style={styles.feedbackSubtitle}>Novas práticas vão aparecer aqui.</Text>
        </View>
      );
    }
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {practices.map((practice) => (
          <PracticeCard key={practice.id} practice={practice} onPress={handlePracticePress} />
        ))}
      </ScrollView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.headerContainer}>
        <Header />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  centerFeedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 8,
  },
  feedbackTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
    marginTop: 8,
  },
});
