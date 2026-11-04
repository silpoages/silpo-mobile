import { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import { EmotionButton } from '@/components/emotions/EmotionButton';
import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { MoodId } from '@/components/emotions/moodLogService';
import { formatDiaryDate } from '@/features/diary/diaryDate';
import { colors, fontFamily, fontSize, layout, radii, spacing } from '@/theme';

const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

/** Mesma largura máxima das telas (390): em tablet e na web o sheet não estica. */
const MAX_SHEET_WIDTH = layout.contentMaxWidth + layout.screenPadding * 2;

const EMOTION_ICON_SIZE = 24;
const PHOTO_ICON_SIZE = 18;

const SAVE_ERROR_MESSAGE =
  'Não foi possível salvar agora. Seu relato continua aqui, tente de novo.';
const PHOTO_ERROR_MESSAGE = 'Não foi possível abrir suas fotos. Tente de novo.';

/** O que o sheet entrega para quem vai gravar o relato. */
export type DiaryEntryDraft = {
  entryDate: Date;
  mood: MoodId;
  note: string;
  /** Endereço local da foto escolhida na galeria, ou `null` sem foto. */
  photoUri: string | null;
};

type DiaryEntryBottomSheetProps = {
  visible: boolean;
  entryDate: Date;
  onClose: () => void;
  onSave: (entry: DiaryEntryDraft) => Promise<void>;
};

export function DiaryEntryBottomSheet({
  visible,
  entryDate,
  onClose,
  onSave,
}: DiaryEntryBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  // 0 = fechado (fundo transparente, sheet abaixo da tela); 1 = aberto.
  const [progress] = useState(() => new Animated.Value(0));
  // Mantém o Modal montado enquanto a animação de fechar ainda está rodando.
  const [isMounted, setIsMounted] = useState(visible);

  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (visible && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? OPEN_DURATION_MS : CLOSE_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) {
        // Fechou (por "Agora não", pelo fundo ou depois de salvar): o próximo
        // relato começa em branco. Por isso cancelar não guarda nada.
        setIsMounted(false);
        setSelectedMood(null);
        setNote('');
        setPhotoUri(null);
        setErrorMessage(null);
      }
    });
  }, [visible, isMounted, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  const selectedEmotion = EMOTIONS.find((emotion) => emotion.id === selectedMood);
  const canSave = selectedMood !== null && note.trim().length > 0;

  function handleClose() {
    // Enquanto salva, não deixa fechar: o relato ainda pode falhar e precisa continuar aqui.
    if (isSaving) {
      return;
    }

    onClose();
  }

  async function handlePickPhoto() {
    setErrorMessage(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      // Se a pessoa fechar a galeria sem escolher, mantém a foto que já estava.
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      setErrorMessage(PHOTO_ERROR_MESSAGE);
    }
  }

  async function handleSave() {
    if (selectedMood === null || !canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onSave({ entryDate, mood: selectedMood, note: note.trim(), photoUri });
      onClose();
    } catch {
      // Não limpa nada: a emoção e o texto continuam no formulário para tentar de novo.
      setErrorMessage(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            accessibilityLabel="Fechar formulário"
            accessibilityRole="button"
            onPress={handleClose}
            style={styles.fill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + spacing.xxl, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Text style={styles.dateLabel}>{formatDiaryDate(entryDate)}</Text>

              {selectedEmotion ? (
                <View style={styles.moodBadge}>
                  <Text style={styles.moodBadgeText}>{selectedEmotion.label}</Text>
                </View>
              ) : null}
            </View>

            <Text accessibilityRole="header" style={styles.question}>
              Como foi o dia {entryDate.getDate()}?
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.emotionsScroll}
              contentContainerStyle={styles.emotionsContent}
            >
              {EMOTIONS.map((emotion) => (
                <EmotionButton
                  key={emotion.id}
                  emoji={
                    <MaterialCommunityIcons
                      name={emotion.iconName}
                      size={EMOTION_ICON_SIZE}
                      color={colors.textSecondary}
                    />
                  }
                  label={emotion.label}
                  isSelected={selectedMood === emotion.id}
                  disabled={isSaving}
                  onPress={() => setSelectedMood(emotion.id)}
                />
              ))}
            </ScrollView>

            <TextInput
              accessibilityLabel="Como foi o seu dia"
              editable={!isSaving}
              multiline
              onChangeText={setNote}
              placeholder="Escreva como foi o seu dia..."
              placeholderTextColor={colors.textMuted}
              style={styles.noteInput}
              textAlignVertical="top"
              value={note}
            />

            {photoUri ? (
              <Image
                accessibilityLabel="Foto escolhida para o relato"
                source={{ uri: photoUri }}
                style={styles.photoPreview}
              />
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              hitSlop={spacing.md}
              onPress={handlePickPhoto}
              style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={PHOTO_ICON_SIZE}
                color={colors.textSecondary}
              />
              <Text style={styles.photoActionText}>
                {photoUri ? 'Editar Foto' : 'Adicionar foto'}
              </Text>
            </Pressable>

            {errorMessage ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              accessibilityHint={
                canSave ? undefined : 'Escolha uma emoção e escreva o relato para poder salvar'
              }
              disabled={!canSave}
              loading={isSaving}
              onPress={handleSave}
              style={styles.saveButton}
            >
              Salvar
            </Button>
            <Button variant="ghost" onPress={handleClose} disabled={isSaving}>
              Agora não
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 51, 41, 0.25)',
  },
  fill: {
    flex: 1,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  moodBadge: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  moodBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  question: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.text,
  },
  emotionsScroll: {
    marginHorizontal: -layout.screenPadding,
  },
  emotionsContent: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  noteInput: {
    minHeight: 96,
    maxHeight: 200,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: spacing.xl,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    color: colors.text,
    outlineWidth: 0,
  },
  photoPreview: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  photoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
  },
  photoActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  saveButton: {
    flex: 1,
  },
});
