import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { useSession } from '@/features/auth/session/SessionContext';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { createEmergencyContact } from '@/features/supportScreen/emergencyContactsService';
import { ApiError } from '@/services/apiClient';
import { colors, fontFamily, fontSize, spacing, typography } from '@/theme';

const GENERIC_ERROR_MESSAGE =
  'Não foi possível adicionar agora. Tente novamente ou pule esta etapa.';

/** Etapa 2 de 3: pessoa de conforto, opcional (nó 4236:1031 do Figma). */
export function OnboardingStep2Screen() {
  const router = useRouter();
  const session = useSession();
  const { supportName, setSupportName, supportPhone, setSupportPhone } = useOnboarding();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function goToStep3() {
    router.push('/onboarding/etapa-3');
  }

  async function handleContinue() {
    const trimmedName = supportName.trim();
    const trimmedPhone = supportPhone.trim();

    if (trimmedName.length === 0 || trimmedPhone.length === 0) {
      goToStep3();
      return;
    }

    if (!session.token) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createEmergencyContact(session.token, {
        fullName: trimmedName,
        phoneNumber: trimmedPhone,
      });
      goToStep3();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <OnboardingHeader onPressBack={() => router.back()} step={2} />

        <View style={styles.content}>
          <Text style={styles.title}>Quem é sua pessoa de conforto?</Text>
          <Text style={styles.subtitle}>
            Essa pessoa poderá aparecer como contato rápido quando você precisar de apoio. É
            opcional — e você pode mudar depois.
          </Text>

          <TextField
            autoCapitalize="words"
            editable={!isSubmitting}
            onChangeText={setSupportName}
            placeholder="Nome"
            returnKeyType="next"
            testID="support-name-field"
            value={supportName}
          />

          <TextField
            editable={!isSubmitting}
            keyboardType="phone-pad"
            onChangeText={setSupportPhone}
            placeholder="Telefone"
            returnKeyType="done"
            testID="support-phone-field"
            value={supportPhone}
          />
        </View>

        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.formError}>
            {errorMessage}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            loading={isSubmitting}
            onPress={handleContinue}
            size="lg"
            testID="continue-button"
          >
            Continuar
          </Button>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={goToStep3}
            style={styles.skipButton}
            testID="skip-button"
          >
            <Text style={styles.skipLabel}>Pular esta etapa</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  formError: {
    ...typography.footnote,
    color: colors.danger,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  skipLabel: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
});
