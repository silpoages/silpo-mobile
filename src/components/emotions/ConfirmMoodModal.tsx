import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '@/components/Button';
import { colors, fontFamily, fontSize } from '@/theme';

type ConfirmMoodModalProps = {
  visible: boolean;
  moodLabel: string;
  loading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmMoodModal({
  visible,
  moodLabel,
  loading,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmMoodModalProps) {
  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} disabled={loading} />

        <View style={styles.card}>
          <Text style={styles.title}>Confirmar emoção</Text>
          <Text style={styles.description}>
            Você selecionou <Text style={styles.moodLabel}>{moodLabel}</Text> para hoje. Depois de
            confirmar, essa escolha não poderá ser alterada até o próximo dia. Tem certeza?
          </Text>

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button variant="secondary" onPress={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onPress={onConfirm} loading={loading}>
              Confirmar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 51, 41, 0.45)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.title,
    color: colors.text,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  moodLabel: {
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
