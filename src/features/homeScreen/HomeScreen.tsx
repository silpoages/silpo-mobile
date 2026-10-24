import { useCallback, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Header } from '@/components/homeScreen/Header';
import { EmotionsRow } from '@/components/emotions/EmotionsRow';
import { DailyPractice } from '@/components/homeScreen/DailyPractice';
import { ActionRow } from '@/components/QuickActions/ActionRow';
import { ContinueJourneyCard } from '@/components/ContinueJourneyCard';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  getDailyGoodPractice,
  type DailyGoodPractice,
} from '@/features/goodPracticesScreen/goodPracticesService';

/** Placeholder até o backend expor os dias de registro do mês. */
const DAYS_REGISTERED_THIS_MONTH = 8;

/** Quick actions com uma tela própria já implementada — as demais ainda não têm destino. */
const ACTION_ROUTES: Record<string, '/respiracao'> = {
  respire: '/respiracao',
};

export function HomeScreen() {
  const router = useRouter();
  const session = useSession();
  const [dailyPractice, setDailyPractice] = useState<DailyGoodPractice | null>(null);
  const [practiceState, setPracticeState] = useState<'loading' | 'error' | 'empty' | 'success'>(
    'loading',
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!session.token) {
        setDailyPractice(null);
        setPracticeState('empty');
        return;
      }

      setDailyPractice(null);
      setPracticeState('loading');
      getDailyGoodPractice(session.token)
        .then((practice) => {
          if (!active) return;
          setDailyPractice(practice);
          setPracticeState(practice ? 'success' : 'empty');
        })
        .catch(() => {
          if (!active) return;
          setDailyPractice(null);
          setPracticeState('error');
        });

      return () => {
        active = false;
      };
    }, [session.token]),
  );

  function handleStartDailyPractice() {
    if (!dailyPractice) return;

    router.push({
      pathname: '/praticas-do-bem',
      params: {
        id: dailyPractice.id,
        title: dailyPractice.title,
        description: dailyPractice.description,
        source: 'daily',
      },
    });
  }

  function handleSelectAction(action: string) {
    const route = ACTION_ROUTES[action];

    if (route) {
      router.push(route);
    }
  }

  const userName = session.user?.fullName?.trim() || session.user?.email || '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          onPressAvatar={() => router.push('/perfil')}
          subtitle="Seus sentimentos importam"
          userName={userName}
        />
        <EmotionsRow />
        <DailyPractice
          title={
            dailyPractice?.title ??
            (practiceState === 'loading'
              ? 'Carregando prática do dia...'
              : practiceState === 'error'
                ? 'Não foi possível carregar a prática'
                : 'Nenhuma prática disponível')
          }
          description={
            dailyPractice?.description ??
            (practiceState === 'error'
              ? 'Verifique sua conexão e tente novamente.'
              : practiceState === 'empty'
                ? ''
                : '')
          }
          onPressStart={dailyPractice ? handleStartDailyPractice : undefined}
          completedToday={dailyPractice?.completedToday}
          onPressSeeOthers={() => router.push('/praticas')}
        />
        <ActionRow onSelectAction={handleSelectAction} />
        <ContinueJourneyCard
          daysRegistered={DAYS_REGISTERED_THIS_MONTH}
          onPress={() => router.push('/jornada')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 22,
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
