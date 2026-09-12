import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { CloseButton } from '@/components/CloseButton';
import { HeartIcon } from '@/components/icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ContactCard } from '@/components/supportScreen/ContactCard';
import { useSession } from '@/features/auth/session/SessionContext';
import { AddContactModal } from '@/features/supportScreen/AddContactModal';
import {
  createEmergencyContact,
  listEmergencyContacts,
  type EmergencyContact,
} from '@/features/supportScreen/emergencyContactsService';
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

const CVV_PHONE_NUMBER = '188';

export function SupportScreen() {
  const router = useRouter();
  const session = useSession();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [addContactError, setAddContactError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!session.token) {
      return;
    }

    setIsLoadingContacts(true);

    try {
      const result = await listEmergencyContacts(session.token);
      setContacts(result);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [session.token]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  function handleCallCvv() {
    Linking.openURL(`tel:${CVV_PHONE_NUMBER}`);
  }

  function handleAddContactPress() {
    setAddContactError(null);
    setIsAddModalVisible(true);
  }

  async function handleConfirmAddContact(fullName: string, phoneNumber: string) {
    if (!session.token) {
      return;
    }

    setIsSubmittingContact(true);
    setAddContactError(null);

    try {
      const created = await createEmergencyContact(session.token, { fullName, phoneNumber });
      setContacts((current) => [created, ...current]);
      setIsAddModalVisible(false);
    } catch {
      setAddContactError('Não foi possível adicionar agora. Tente novamente.');
    } finally {
      setIsSubmittingContact(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apoio</Text>
        <CloseButton onPress={handleClose} />
      </View>

      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <HeartIcon size={22} color={colors.support.dark} />
        </View>
        <Text style={styles.introTitle}>Você não precisa enfrentar esse momento sozinho.</Text>
        <Text style={styles.introSubtitle}>Estas opções estão aqui para você, sempre.</Text>
      </View>

      <View style={styles.section}>
        {session.isAuthenticated
          ? !isLoadingContacts &&
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                fullName={contact.fullName}
                phoneNumber={contact.phoneNumber}
              />
            ))
          : null}

        <View style={styles.cvvCard}>
          <Text style={styles.cvvTitle}>CVV — Centro de Valorização da Vida</Text>
          <Text style={styles.cvvDescription}>Conversa gratuita e sigilosa, 24 horas por dia.</Text>
          <Button variant="supportText" shape="pill" onPress={handleCallCvv}>
            Ligar 188
          </Button>
        </View>

        <View style={styles.breathingCard}>
          <View style={styles.breathingTextContainer}>
            <Text style={styles.breathingTitle}>Respirar pode ajudar agora</Text>
            <Text style={styles.breathingDescription}>Um exercício guiado de 3 minutos.</Text>
          </View>
          <Button variant="secondary" size="sm">
            Começar
          </Button>
        </View>

        {session.isAuthenticated ? (
          <Button variant="support" size="lg" onPress={handleAddContactPress}>
            + Adicionar pessoa de conforto
          </Button>
        ) : null}
      </View>

      <Text style={styles.disclaimer}>
        O Silpo não substitui atendimento médico, psicológico ou serviços de emergência.
      </Text>

      <AddContactModal
        visible={isAddModalVisible}
        loading={isSubmittingContact}
        errorMessage={addContactError}
        onClose={() => setIsAddModalVisible(false)}
        onConfirm={handleConfirmAddContact}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.support.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  introTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    color: colors.text,
    textAlign: 'center',
  },
  introSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    gap: spacing.lg,
  },
  cvvCard: {
    backgroundColor: colors.support.surface,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.support.border,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  cvvTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.support.text,
  },
  cvvDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.support.muted,
  },
  breathingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  breathingTextContainer: {
    flex: 1,
  },
  breathingTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  breathingDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
