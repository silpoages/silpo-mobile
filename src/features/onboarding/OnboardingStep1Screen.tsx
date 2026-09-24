import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { BirthDateField } from '@/components/onboarding/BirthDateField';
import { GenderSelectField } from '@/components/onboarding/GenderSelectField';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { useSession } from '@/features/auth/session/SessionContext';
import { toISODate } from '@/features/onboarding/date';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { ApiError } from '@/services/apiClient';
import { updateCurrentUser } from '@/services/user';
import { colors, fontFamily, fontSize, spacing, typography } from '@/theme';

const GENERIC_ERROR_MESSAGE = 'Não foi possível salvar agora. Tente novamente.';

type Step1Errors = {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  form?: string;
};

/** Etapa 1 de 3: nome, data de nascimento e gênero (nó 4236:986 do Figma). */
export function OnboardingStep1Screen() {
  const router = useRouter();
  const session = useSession();
  const {
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    gender,
    setGender,
    dailyReminderEnabled,
    setIsProfileSaved,
  } = useOnboarding();

  const [errors, setErrors] = useState<Step1Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePressBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  }

  async function handleContinue() {
    const fullNameError = fullName.trim().length === 0 ? 'O nome é obrigatório.' : undefined;
    const birthDateError = birthDate === null ? 'A data de nascimento é obrigatória.' : undefined;
    const genderError = gender === null ? 'O gênero é obrigatório.' : undefined;

    if (fullNameError || birthDateError || genderError) {
      setErrors({ fullName: fullNameError, birthDate: birthDateError, gender: genderError });
      return;
    }

    if (!session.token || !session.user || !birthDate || !gender) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const updated = await updateCurrentUser(session.token, {
        fullName: fullName.trim(),
        birthDate: toISODate(birthDate),
        gender,
        dailyReminderEnabled,
      });

      await session.login(session.token, {
        ...session.user,
        fullName: updated.fullName,
        onboardingCompleted: updated.onboardingCompleted,
      });
      setIsProfileSaved(true);

      router.push('/onboarding/etapa-2');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE;
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <OnboardingHeader onPressBack={handlePressBack} step={1} />

        <View style={styles.content}>
          <Text style={styles.title}>Como você gostaria de ser chamado?</Text>
          <Text style={styles.subtitle}>
            É assim que vamos falar com você. Pode mudar quando quiser.
          </Text>

          <TextField
            autoCapitalize="words"
            editable={!isSubmitting}
            errorMessage={errors.fullName}
            onChangeText={(newValue) => {
              setFullName(newValue);
              setErrors((current) => ({ ...current, fullName: undefined, form: undefined }));
            }}
            placeholder="Seu nome ou apelido"
            returnKeyType="next"
            testID="full-name-field"
            value={fullName}
          />

          <BirthDateField
            errorMessage={errors.birthDate}
            onChange={(newValue) => {
              setBirthDate(newValue);
              setErrors((current) => ({ ...current, birthDate: undefined, form: undefined }));
            }}
            value={birthDate}
          />

          <GenderSelectField
            errorMessage={errors.gender}
            onChange={(newValue) => {
              setGender(newValue);
              setErrors((current) => ({ ...current, gender: undefined, form: undefined }));
            }}
            value={gender}
          />
        </View>

        {errors.form ? (
          <Text accessibilityRole="alert" style={styles.formError}>
            {errors.form}
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
});
