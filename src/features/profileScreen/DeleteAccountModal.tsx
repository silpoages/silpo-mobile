import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '@/components/Button';
import { colors, fontFamily, fontSize } from '@/theme';

const CONFIRMATION_WORD = 'deletar';

type DeleteAccountModalProps = {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAccountModal({
  visible,
  loading,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (!visible) {
      setConfirmationText('');
    }
  }, [visible]);

  const canConfirm = confirmationText.trim().toLowerCase() === CONFIRMATION_WORD;

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
          <Text style={styles.title}>Excluir conta</Text>
          <Text style={styles.description}>
            Essa ação é permanente. Para confirmar, digite{' '}
            <Text style={styles.confirmationWord}>{CONFIRMATION_WORD}</Text> abaixo.
          </Text>

          <TextInput
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder={CONFIRMATION_WORD}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button variant="secondary" onPress={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onPress={onConfirm}
              disabled={!canConfirm}
              loading={loading}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            >
              Excluir
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
  confirmationWord: {
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.textInverse,
  },
});
