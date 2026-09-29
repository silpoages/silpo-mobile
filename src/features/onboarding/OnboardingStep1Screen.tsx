import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextField } from '@/components/TextField';
import { BirthDateField } from '@/components/onboarding/BirthDateField';
import { GenderSelectField } from '@/components/onboarding/GenderSelectField';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { colors, fontFamily, fontSize, spacing, typography } from '@/theme';

type Step1Errors = {
  fullName?: string;
  birthDate?: string;
  gender?: string;
};

/**
 * Etapa 1 de 3: nome, data de nascimento e gênero (nó 4236:986 do Figma).
 * O `PATCH /users` só acontece na etapa 3: o backend marca `onboarding_completed`
 * em qualquer atualização, e o guard usa essa flag para saber se o fluxo acabou.
 */
export function OnboardingStep1Screen() {
  const router = useRouter();
  const { fullName, setFullName, birthDate, setBirthDate, gender, setGender } = useOnboarding();

  const [errors, setErrors] = useState<Step1Errors>({});

  function handleContinue() {
    const fullNameError = fullName.trim().length === 0 ? 'O nome é obrigatório.' : undefined;
    const birthDateError = birthDate === null ? 'A data de nascimento é obrigatória.' : undefined;
    const genderError = gender === null ? 'O gênero é obrigatório.' : undefined;

    if (fullNameError || birthDateError || genderError) {
      setErrors({ fullName: fullNameError, birthDate: birthDateError, gender: genderError });
      return;
    }

    setErrors({});
    router.push('/onboarding/etapa-2');
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <OnboardingHeader step={1} />

        <View style={styles.content}>
          <Text style={styles.title}>Como você gostaria de ser chamado?</Text>
          <Text style={styles.subtitle}>
            É assim que vamos falar com você. Pode mudar quando quiser.
          </Text>

          <TextField
            autoCapitalize="words"
            errorMessage={errors.fullName}
            onChangeText={(newValue) => {
              setFullName(newValue);
              setErrors((current) => ({ ...current, fullName: undefined }));
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
              setErrors((current) => ({ ...current, birthDate: undefined }));
            }}
            value={birthDate}
          />

          <GenderSelectField
            errorMessage={errors.gender}
            onChange={(newValue) => {
              setGender(newValue);
              setErrors((current) => ({ ...current, gender: undefined }));
            }}
            value={gender}
          />
        </View>

        <View style={styles.actions}>
          <Button onPress={handleContinue} size="lg" testID="continue-button">
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
  actions: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
});
