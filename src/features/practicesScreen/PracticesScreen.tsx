import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors, fontFamily, fontSize, layout, spacing } from '@/theme';
import { Header } from '@/components/practicesScreen/Header';
import { PracticeCard, Practice } from '@/components/practicesScreen/PracticeCard';
import { useSession } from '@/features/auth/session/SessionContext';
import { listGoodPractices } from '@/features/goodPracticesScreen/goodPracticesService';

type ScreenState = 'loading' | 'error' | 'empty' | 'success';

export function PracticesScreen() {
  const router = useRouter();
  const session = useSession();
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [practices, setPractices] = useState<Practice[]>([]);

  const loadPractices = useCallback(async () => {
    if (!session.token) {
      setScreenState('error');
      return;
    }

    setScreenState('loading');

    try {
      const items = await listGoodPractices(session.token);
      setPractices(items);
      setScreenState(items.length === 0 ? 'empty' : 'success');
    } catch {
      setPractices([]);
      setScreenState('error');
    }
  }, [session.token]);

  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  function handlePracticePress(practice: Practice) {
    router.push({
      pathname: '/praticas-do-bem',
      params: {
        id: practice.id,
        title: practice.title,
        description: practice.description,
        source: 'other',
      },
    });
  }
  function handleRetry() {
    loadPractices();
  }
  function renderContent() {
    if (screenState === 'loading') {
      return (
        <View style={styles.centerFeedback}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.feedbackSubtitle}>Carregando práticas...</Text>
        </View>
      );
    }
    if (screenState === 'error') {
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.contentMaxWidth + layout.screenPadding * 2,
    paddingTop: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
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
