import { useCallback, useRef, useState } from 'react';
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
import { useJourney } from '@/features/journeyScreen/useJourney';
import { getTodayDailyMessage } from '@/features/homeScreen/dailyMessageService';

const FALLBACK_SUBTITLE = 'Seus sentimentos importam';

/** Rotas disponíveis para os exercícios rápidos da tela inicial. */
const ACTION_ROUTES: Record<string, '/respiracao' | '/meditations' | '/bolinhas'> = {
  respire: '/respiracao',
  medite: '/meditations',
  momento: '/bolinhas',
};

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function HomeScreen() {
  const router = useRouter();
  const session = useSession();
  const { journey, refresh: refreshJourney } = useJourney();
  const [dailyPractice, setDailyPractice] = useState<DailyGoodPractice | null>(null);
  const [subtitle, setSubtitle] = useState(FALLBACK_SUBTITLE);
  const dailyMessageCache = useRef<{ day: string; message: string } | null>(null);
  const [practiceState, setPracticeState] = useState<'loading' | 'error' | 'empty' | 'success'>(
    'loading',
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!session.token) {
        setDailyPractice(null);
        setPracticeState('empty');
        setSubtitle(FALLBACK_SUBTITLE);
        return;
      }

      const day = todayKey();
      if (dailyMessageCache.current?.day === day) {
        setSubtitle(dailyMessageCache.current.message);
      } else {
        getTodayDailyMessage(session.token)
          .then((message) => {
            if (!active || !message) return;
            dailyMessageCache.current = { day, message };
            setSubtitle(message);
          })
          .catch(() => {
            if (!active) return;
            setSubtitle(FALLBACK_SUBTITLE);
          });
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
          subtitle={subtitle}
          userName={userName}
        />
        <EmotionsRow onMoodRegistered={refreshJourney} />
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
          daysRegistered={journey?.daysRegistered ?? null}
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
