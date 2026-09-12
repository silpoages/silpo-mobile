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
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

type AddContactModalProps = {
  visible: boolean;
  loading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: (fullName: string, phoneNumber: string) => void;
};

export function AddContactModal({
  visible,
  loading,
  errorMessage,
  onClose,
  onConfirm,
}: AddContactModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!visible) {
      setFullName('');
      setPhoneNumber('');
    }
  }, [visible]);

  const canConfirm = fullName.trim().length > 0 && phoneNumber.trim().length > 0;

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  function handleConfirm() {
    onConfirm(fullName.trim(), phoneNumber.trim());
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} disabled={loading} />

        <View style={styles.card}>
          <Text style={styles.title}>Adicionar pessoa de conforto</Text>
          <Text style={styles.description}>
            Essa pessoa vai aparecer na sua lista de contatos de apoio, com um botão pra ligar
            rapidamente quando precisar.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nome da pessoa"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+55 51 99999-8888"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              editable={!loading}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button variant="secondary" onPress={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="support"
              onPress={handleConfirm}
              disabled={!canConfirm}
              loading={loading}
            >
              Adicionar
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
    paddingHorizontal: spacing.xxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 51, 41, 0.45)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.field + 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    gap: spacing.lg,
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
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
