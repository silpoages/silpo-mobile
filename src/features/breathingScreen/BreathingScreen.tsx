import CloseButton from '@/components/breathScreen/CloseButton';
import PauseButton from '@/components/breathScreen/PauseButton';
import EndPracticeButton from '@/components/breathScreen/EndPracticeButton';
import PracticeModalButton from '@/components/breathScreen/PracticeModalButton';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';
import BreathBall from '@/components/breathScreen/BreathBall';
import { fontFamily, fontSize } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const phases = [
  {
    text: 'Inspire...',
    duration: 4,
  },
  {
    text: 'Segure...',
    duration: 7,
  },
  {
    text: 'Solte...',
    duration: 8,
  },
];

const phaseGuide = [
  { title: 'Inspire', description: 'Puxe o ar devagar pelo nariz.', duration: '4 segundos' },
  { title: 'Segure', description: 'Mantenha o ar com tranquilidade.', duration: '7 segundos' },
  { title: 'Solte', description: 'Expire lentamente pela boca.', duration: '8 segundos' },
];

const minimumBallScale = 0.65;

export default function BreathingScreen() {
  const [timer, setTimer] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [cycles, setCycles] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const ballScale = useRef(new Animated.Value(minimumBallScale)).current;
  const modalTranslateY = useRef(new Animated.Value(320)).current;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ballSize = Math.min(Math.max(width * 0.48, 144), 260, height * 0.32);

  const handleEndPractice = () => {
    ballScale.stopAnimation();
    ballScale.setValue(minimumBallScale);
    setTimer(0);
    setPhaseIndex(0);
    setCycles(0);
    setPaused(true);
    closeModal();
  };

  const openModal = () => {
    setPaused(true);
    ballScale.stopAnimation();
    setModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 320,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
      }
    });
  };

  useEffect(() => {
    if (paused) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (paused) {
      return;
    }

    const targetScale = phaseIndex === 0 ? 1 : minimumBallScale;
    const isHoldPhase = phaseIndex === 1;

    if (isHoldPhase) {
      ballScale.stopAnimation();
      return;
    }

    const animation = Animated.timing(ballScale, {
      toValue: targetScale,
      duration: Math.max((phases[phaseIndex].duration - timer) * 1000, 1),
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [ballScale, paused, phaseIndex]);

  useEffect(() => {
    if (timer >= phases[phaseIndex].duration) {
      if (phaseIndex === phases.length - 1) {
        setCycles((prevCycles) => prevCycles + 1);
      }

      setPhaseIndex((prevIndex) => (prevIndex + 1) % phases.length);
      setTimer(0);
    }
  }, [phaseIndex, timer]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.header}>
        <CloseButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))} />
      </View>

      <View style={styles.content}>
        <View style={styles.ball}>
          <BreathBall size={ballSize} color={colors.primaryDark} scale={ballScale} />
        </View>

        <View style={styles.textBox}>
          <View style={styles.titleRow}>
            <View style={styles.modalButton}>
              <PracticeModalButton onPress={openModal} />
            </View>
            <Text style={styles.title}>{phases[phaseIndex]?.text}</Text>
          </View>
          <Text style={styles.subtitle}>
            {timer}s · {cycles} ciclos completos
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PauseButton paused={paused} onPress={() => setPaused((prevPaused) => !prevPaused)} />
        <EndPracticeButton onPress={handleEndPractice} />
      </View>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <Animated.View
            style={[styles.modalSheet, { transform: [{ translateY: modalTranslateY }] }]}
          >
            <Text style={styles.modalTitle}>Como respirar corretamente</Text>
            <Text style={styles.modalSubtitle}>Acompanhe cada etapa da prática.</Text>
            <View style={styles.guideList}>
              {phaseGuide.map((phase) => (
                <View key={phase.title} style={styles.guideItem}>
                  <View style={styles.guideText}>
                    <Text style={styles.guideTitle}>{phase.title}</Text>
                    <Text style={styles.guideDescription}>{phase.description}</Text>
                  </View>
                  <Text style={styles.guideDuration}>{phase.duration}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  ball: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalButton: {
    position: 'absolute',
    right: 0,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    gap: 14,
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
    minHeight: 300,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.heading,
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  guideList: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  guideText: {
    gap: 2,
  },
  guideTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  guideDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  guideDuration: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
  },
});
