import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import MeditationCard from '@/components/meditationScreen/MeditationCard';
import { MeditationHeader } from '@/components/meditationScreen/MeditationHeader';
import { colors, fontFamily, fontSize, spacing } from '@/theme';
import { AuthFormFooter } from '../auth/components';
import NoMeditationCard from '@/components/meditationScreen/NoMeditationCard';
import { useState } from 'react';
import { MeditationSelection } from '@/components/meditationScreen/MeditationSelection';
import type { Meditation } from './meditationService';
import { useMeditations } from './useMeditations';

const PREPARATION_STEPS = [
  'Encontre uma posição confortável, sentado ou deitado.',
  'Se puder, use fones de ouvido.',
  'Você pode pausar ou encerrar quando quiser.',
];

function toMinutes(durationSeconds: number | null) {
  return Math.ceil((durationSeconds ?? 0) / 60);
}

export function MeditationScreen() {
  const router = useRouter();
  const { meditations, isLoading, hasError, retry } = useMeditations();
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);

  function handleBack() {
    if (selectedMeditation) {
      setSelectedMeditation(null);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  function handleStart(meditation: Meditation) {
    router.push({
      pathname: '/meditation-player',
      params: {
        meditation_id: meditation.id,
        title: meditation.title,
        audio_url: meditation.audioUrl,
        ...(meditation.durationSeconds
          ? { max_time_seconds: String(meditation.durationSeconds) }
          : {}),
      },
    });
  }

  return (
    <ScreenContainer background={colors.surfaceTint} contentStyle={styles.screenContent}>
      <BackButton onPress={handleBack} />
      {selectedMeditation ? (
        <MeditationSelection
          title={selectedMeditation.title}
          description={selectedMeditation.description}
          time={toMinutes(selectedMeditation.durationSeconds)}
          preparationTitle="ANTES DE COMEÇAR"
          preparationSteps={PREPARATION_STEPS}
          buttonMain={{
            text: 'Começar meditação',
            onPress: () => handleStart(selectedMeditation),
          }}
          buttonSecondary={{ text: 'Agora não', onPress: handleBack }}
        />
      ) : (
        <>
          <MeditationHeader title="Meditações" subtitle="Áudios guiados para voltar ao presente." />

          {isLoading ? (
            <View style={styles.centerFeedback}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.feedbackSubtitle}>Carregando meditações...</Text>
            </View>
          ) : hasError || meditations === null ? (
            <View style={styles.centerFeedback}>
              <Text style={styles.feedbackTitle}>Não foi possível carregar as meditações</Text>
              <Text style={styles.feedbackSubtitle}>Verifique sua conexão e tente de novo.</Text>
              <Pressable
                onPress={retry}
                hitSlop={8}
                accessibilityRole="button"
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Tentar de novo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cardList}>
              {meditations.length > 0 ? (
                meditations.map((meditation) => (
                  <MeditationCard
                    key={meditation.id}
                    title={meditation.title}
                    description={meditation.description}
                    time={toMinutes(meditation.durationSeconds)}
                    onPress={() => setSelectedMeditation(meditation)}
                  />
                ))
              ) : (
                <View style={{ alignItems: 'center', gap: 16 }}>
                  <NoMeditationCard />
                  <AuthFormFooter
                    actionLabel="Voltar para o início"
                    onPressAction={() => router.navigate('/')}
                  />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  cardList: {
    gap: 16,
    padding: 16,
  },
  centerFeedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 48,
    gap: spacing.md,
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
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
