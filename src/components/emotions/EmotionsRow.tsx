import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { EmotionButton } from './EmotionButton';
import { ConfirmMoodModal } from './ConfirmMoodModal';
import { createMoodLog, getTodayMoodLog, type MoodId } from './moodLogService';
import { ApiError } from '@/services/apiClient';
import { useSession } from '@/features/auth/session/SessionContext';
import { colors, fontFamily, fontSize } from '@/theme';

const ICON_SIZE = 24;
const ICON_COLOR = colors.textSecondary;

const happyIcon = (
  <MaterialCommunityIcons name="emoticon-excited-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const wellIcon = (
  <MaterialCommunityIcons name="emoticon-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const tiredIcon = (
  <MaterialCommunityIcons name="emoticon-neutral-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const sadIcon = (
  <MaterialCommunityIcons name="emoticon-sad-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const anxiousIcon = (
  <MaterialCommunityIcons name="emoticon-frown-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const angryIcon = (
  <MaterialCommunityIcons name="emoticon-angry-outline" size={ICON_SIZE} color={ICON_COLOR} />
);

const EMOTIONS: { id: MoodId; emoji: typeof happyIcon; label: string }[] = [
  { id: 'FELIZ', emoji: happyIcon, label: 'Feliz' },
  { id: 'BEM', emoji: wellIcon, label: 'Bem' },
  { id: 'CANSADO', emoji: tiredIcon, label: 'Cansado' },
  { id: 'TRISTE', emoji: sadIcon, label: 'Triste' },
  { id: 'ANSIOSO', emoji: anxiousIcon, label: 'Ansioso' },
  { id: 'IRRITADO', emoji: angryIcon, label: 'Irritado' },
];

const GENERIC_ERROR_MESSAGE = 'Não foi possível registrar agora. Tente novamente.';

export function EmotionsRow() {
  const session = useSession();

  const [todayMood, setTodayMood] = useState<MoodId | null>(null);
  const [isCheckingToday, setIsCheckingToday] = useState(true);
  const [pendingMood, setPendingMood] = useState<MoodId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTodayMood = useCallback(async () => {
    if (!session.token) {
      setIsCheckingToday(false);
      return;
    }

    try {
      const log = await getTodayMoodLog(session.token);
      setTodayMood(log?.mood ?? null);
    } catch {
      // Falha na checagem inicial não deve travar a UI — o back segue sendo a
      // fonte da verdade e rejeita um segundo registro no mesmo dia (409).
    } finally {
      setIsCheckingToday(false);
    }
  }, [session.token]);

  useEffect(() => {
    loadTodayMood();
  }, [loadTodayMood]);

  const isLocked = todayMood !== null || isCheckingToday;

  function handlePress(emotionId: MoodId) {
    if (isLocked) {
      return;
    }

    setErrorMessage(null);
    setPendingMood(emotionId);
  }

  function handleCloseModal() {
    if (isSubmitting) {
      return;
    }

    setPendingMood(null);
    setErrorMessage(null);
  }

  async function handleConfirm() {
    if (!pendingMood || !session.token) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const log = await createMoodLog(session.token, pendingMood);
      setTodayMood(log.mood);
      setPendingMood(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        await loadTodayMood();
        setPendingMood(null);
      } else {
        setErrorMessage(GENERIC_ERROR_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const pendingEmotion = EMOTIONS.find((item) => item.id === pendingMood);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Como você está se sentindo hoje?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        persistentScrollbar={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EMOTIONS.map((item) => (
          <EmotionButton
            key={item.id}
            emoji={item.emoji}
            label={item.label}
            isSelected={todayMood === item.id}
            disabled={isLocked}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </ScrollView>

      <ConfirmMoodModal
        visible={pendingEmotion !== undefined}
        moodLabel={pendingEmotion?.label ?? ''}
        loading={isSubmitting}
        errorMessage={errorMessage}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    padding: 18,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.text,
    marginBottom: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
