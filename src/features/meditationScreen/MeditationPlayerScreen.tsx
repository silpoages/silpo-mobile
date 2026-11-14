import Feather from '@expo/vector-icons/Feather';
import { useEventListener } from 'expo';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BackButton } from '@/components/BackButton';
import { EndPracticeButton } from '@/components/breathingScreen/EndPracticeButton';
import Button from '@/components/Button';
import { MeditationSelection } from '@/components/meditationScreen/MeditationSelection';
import { ScreenContainer } from '@/components/ScreenContainer';
import { PlaybackErrorCard } from '@/components/meditationScreen/PlaybackErrorCard';
import { PlayerButton } from '@/components/meditationScreen/PlayerButton';
import { useAchievementAlerts } from '@/features/achievements/AchievementAlertContext';
import { useSession } from '@/features/auth/session/SessionContext';
import { ApiError } from '@/services/apiClient';
import { colors, fontFamily, fontSize } from '@/theme';
import { registerMeditationSession } from './meditationService';

const DEFAULT_MAX_TIME_SECONDS = 10 * 60;

type RecordStatus = 'idle' | 'saving' | 'saved' | 'error';

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MeditationPlayerScreen() {
  const router = useRouter();
  const session = useSession();
  const { checkForNewAchievements } = useAchievementAlerts();
  const params = useLocalSearchParams<{
    meditation_id?: string;
    title?: string;
    max_time_seconds?: string;
    audio_url?: string;
  }>();
  const { width, height } = useWindowDimensions();
  const meditationId = getSingleParam(params.meditation_id);
  const title = getSingleParam(params.title) || 'Meditação guiada';
  const audioUrl = getSingleParam(params.audio_url);
  const configuredMaxTime = Number(getSingleParam(params.max_time_seconds));
  const player = useAudioPlayer(audioUrl || null, { updateInterval: 250 });
  const audioStatus = useAudioPlayerStatus(player);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [playFailed, setPlayFailed] = useState(false);
  const pendingResumeSecondsRef = useRef<number | null>(null);
  const [endSheetVisible, setEndSheetVisible] = useState(false);
  const [finished, setFinished] = useState(false);
  const [recordStatus, setRecordStatus] = useState<RecordStatus>('idle');
  const isRecordingRef = useRef(false);
  const completedSecondsRef = useRef<number | null>(null);
  const endSheetTranslateY = useRef(new Animated.Value(360)).current;
  const ballSize = Math.min(Math.max(width * 0.48, 144), 250, height * 0.32);
  const maxTimeSeconds =
    Number.isFinite(configuredMaxTime) && configuredMaxTime > 0
      ? Math.floor(configuredMaxTime)
      : audioStatus.duration > 0
        ? Math.floor(audioStatus.duration)
        : DEFAULT_MAX_TIME_SECONDS;
  const isPlaying = audioUrl
    ? audioStatus.playing
    : isPreviewPlaying && elapsedSeconds < maxTimeSeconds;
  const progressSeconds = audioUrl
    ? Math.min(Math.floor(audioStatus.currentTime), maxTimeSeconds)
    : elapsedSeconds;
  const progress = Math.min(progressSeconds / maxTimeSeconds, 1);
  const isAudioLoading = Boolean(audioUrl) && !audioStatus.isLoaded && !audioStatus.error;
  const hasLoadError = Boolean(audioUrl && audioStatus.error);
  const hasPlaybackError = playFailed || hasLoadError;

  async function resumePlayback(seconds: number) {
    try {
      await player.seekTo(seconds);
      player.play();
    } catch {
      setPlayFailed(true);
    }
  }

  async function recordSession() {
    const timeSpentSeconds = completedSecondsRef.current;
    if (isRecordingRef.current || !meditationId || !session.token || timeSpentSeconds === null) {
      return;
    }

    isRecordingRef.current = true;
    setRecordStatus('saving');

    try {
      await registerMeditationSession(session.token, meditationId, timeSpentSeconds);
      setRecordStatus('saved');
      checkForNewAchievements();
    } catch (error) {
      isRecordingRef.current = false;

      if (error instanceof ApiError && error.status === 401) {
        setRecordStatus('idle');
        void session.logout();
        return;
      }

      setRecordStatus('error');
    }
  }

  useEventListener(player, 'playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      const listenedSeconds = Math.round(status.duration || status.currentTime);
      completedSecondsRef.current = Math.max(1, Math.min(listenedSeconds, maxTimeSeconds));
      setFinished(true);
      void recordSession();
      return;
    }

    const resumeAt = pendingResumeSecondsRef.current;
    if (resumeAt !== null && status.isLoaded) {
      pendingResumeSecondsRef.current = null;
      void resumePlayback(resumeAt);
    }
  });

  function handleRetry() {
    setPlayFailed(false);
    if (!audioUrl) {
      return;
    }

    if (hasLoadError) {
      pendingResumeSecondsRef.current = audioStatus.currentTime;
      player.replace(audioUrl);
      return;
    }

    void togglePlayback();
  }

  function handleClose() {
    player.pause();
    setIsPreviewPlaying(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  const openEndSheet = useCallback(() => {
    player.pause();
    setIsPreviewPlaying(false);
    setEndSheetVisible(true);
    Animated.timing(endSheetTranslateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [endSheetTranslateY, player]);

  const closeEndSheet = useCallback(
    (onClosed?: () => void) => {
      Animated.timing(endSheetTranslateY, {
        toValue: 360,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished: animationFinished }) => {
        if (animationFinished) {
          setEndSheetVisible(false);
          onClosed?.();
        }
      });
    },
    [endSheetTranslateY],
  );

  const handleDrag = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => gestureState.dy < -8,
        onPanResponderRelease: (_event, gestureState) => {
          if (gestureState.dy < -40) {
            openEndSheet();
          }
        },
      }),
    [openEndSheet],
  );

  useEffect(() => {
    if (audioUrl || !isPreviewPlaying || finished || elapsedSeconds >= maxTimeSeconds) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => Math.min(seconds + 1, maxTimeSeconds));
      if (elapsedSeconds + 1 >= maxTimeSeconds) {
        setIsPreviewPlaying(false);
        setFinished(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [audioUrl, elapsedSeconds, finished, isPreviewPlaying, maxTimeSeconds]);

  async function togglePlayback() {
    setPlayFailed(false);
    if (audioUrl) {
      if (audioStatus.playing) {
        player.pause();
        return;
      }

      try {
        await setAudioModeAsync({ playsInSilentMode: true });
        if (progressSeconds >= maxTimeSeconds) {
          player.seekTo(0);
        }
        player.play();
      } catch {
        setPlayFailed(true);
      }
      return;
    }

    if (isPlaying) {
      setIsPreviewPlaying(false);
    } else {
      if (elapsedSeconds >= maxTimeSeconds) {
        setElapsedSeconds(0);
      }
      setIsPreviewPlaying(true);
    }
  }

  function finishMeditation() {
    player.pause();
    setIsPreviewPlaying(false);
    closeEndSheet(() => setFinished(true));
  }

  return (
    <ScreenContainer background={colors.surfaceTint} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <BackButton onPress={handleClose} />
      </View>

      {finished && (recordStatus === 'saving' || recordStatus === 'error') ? (
        <View style={styles.recordFeedback}>
          {recordStatus === 'saving' ? (
            <Text style={styles.recordMessage}>Registrando sua meditação...</Text>
          ) : null}
          {recordStatus === 'error' ? (
            <>
              <Text style={styles.recordError}>Não foi possível registrar a meditação.</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => void recordSession()}
                style={styles.recordAction}
              >
                <Text style={styles.recordActionText}>Tentar registrar de novo</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}

      {finished ? (
        <MeditationSelection
          title={title}
          description="Meditação finalizada. Reserve um momento para perceber como você está se sentindo."
          time={Math.ceil(maxTimeSeconds / 60)}
          preparationTitle="SE QUISER, UM PRÓXIMO PASSO"
          preparationSteps={[
            'Perceba como seu corpo está agora.',
            'Registre no Diário como você se sente.',
            'Volte a esta meditação quando precisar.',
          ]}
          buttonMain={{
            text: 'Fazer outra meditação',
            onPress: () => router.replace('/meditations'),
          }}
          buttonSecondary={{
            text: 'Voltar para o início',
            onPress: () => router.navigate('/'),
          }}
        />
      ) : (
        <>
          <View style={styles.playerContent}>
            <View
              style={[
                styles.disc,
                {
                  width: ballSize,
                  height: ballSize,
                  borderRadius: ballSize / 2,
                },
              ]}
            >
              <View style={styles.discRingOuter} />
              <View style={styles.discRingInner} />
              <View style={styles.discLabel}>
                <View style={styles.discHole} />
              </View>
              <View style={styles.discMarker} />
            </View>

            <View style={styles.trackDetails}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.status}>
                {hasPlaybackError
                  ? 'Meditação Guiada'
                  : isAudioLoading
                    ? 'Carregando…'
                    : isPlaying
                      ? 'Meditação Guiada'
                      : 'Pausado'}
              </Text>
              {hasPlaybackError ? (
                <View style={styles.errorCard}>
                  <PlaybackErrorCard onRetry={handleRetry} onEnd={openEndSheet} />
                </View>
              ) : (
                <View style={styles.progressSection}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                  <View style={styles.timeLabels}>
                    <Text style={styles.timeText}>{formatTime(progressSeconds)}</Text>
                    <Text style={styles.timeText}>{formatTime(maxTimeSeconds)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {hasPlaybackError ? null : (
            <View style={styles.footer}>
              <View style={styles.footerButtons}>
                <PlayerButton
                  icon={
                    <Feather name={isPlaying ? 'pause' : 'play'} size={28} color={colors.surface} />
                  }
                  onPress={() => void togglePlayback()}
                  disabled={isAudioLoading}
                />
                <EndPracticeButton onPress={openEndSheet} label="Encerrar" emphasized />
              </View>
              <View style={styles.endHandleArea} {...handleDrag.panHandlers}>
                <Pressable onPress={openEndSheet} hitSlop={10} style={styles.handlePressable}>
                  <View style={styles.modalHandle} />
                </Pressable>
              </View>
            </View>
          )}

          <Modal
            visible={endSheetVisible}
            transparent
            animationType="none"
            onRequestClose={() => closeEndSheet()}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={() => closeEndSheet()} />
              <Animated.View
                style={[styles.modalSheet, { transform: [{ translateY: endSheetTranslateY }] }]}
              >
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Encerrar meditação?</Text>
                <Text style={styles.sheetSubtitle}>
                  Você pode finalizar agora ou continuar ouvindo.
                </Text>
                <Button size="lg" onPress={finishMeditation}>
                  Encerrar Meditação
                </Button>
                <Button variant="ghost" onPress={() => closeEndSheet()}>
                  Continuar meditação
                </Button>
              </Animated.View>
            </View>
          </Modal>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
  },
  playerContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  discRingOuter: {
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  discRingInner: {
    position: 'absolute',
    width: '66%',
    height: '66%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  discLabel: {
    width: '34%',
    height: '34%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.surfaceTintStrong,
  },
  discHole: {
    width: '14%',
    height: '14%',
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },
  discMarker: {
    position: 'absolute',
    top: '7%',
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.surfaceTintStrong,
  },
  trackDetails: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    color: colors.text,
    textAlign: 'center',
  },
  status: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  progressSection: {
    width: '100%',
    gap: 8,
    marginTop: 6,
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  timeLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  errorCard: {
    width: '100%',
    marginTop: 14,
  },
  recordFeedback: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  recordMessage: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recordError: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.danger,
    textAlign: 'center',
  },
  recordAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  recordActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  footerButtons: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  endHandleArea: {
    minHeight: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handlePressable: {
    width: 120,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHandle: {
    width: 96,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 51, 41, 0.28)',
  },
  modalSheet: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: 6,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.heading,
    color: colors.text,
    textAlign: 'center',
  },
  sheetSubtitle: {
    marginBottom: 8,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
