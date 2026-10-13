import { useEffect, useState } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import { BackHandler, StyleSheet, Text, View } from 'react-native';

import {
  HOME_ROUTE,
  ONBOARDING_FIRST_STEP_ROUTE,
  WELCOME_ROUTE,
} from '@/features/auth/session/routeAccess';
import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { HelpCard } from '@/components/emailConfirmationScreen/HelpCard';
import { StatusBadge } from '@/components/emailConfirmationScreen/StatusBadge';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, fontFamily, fontSize, spacing, typography } from '@/theme';
import { useSession } from '@/features/auth/session/SessionContext';
import { useResendCooldown } from '@/features/emailConfirmationScreen/useResendCooldown';
import { resendConfirmationEmail } from '@/features/emailConfirmationScreen/emailConfirmationServices';
import {
  clearPendingConfirmation,
  getPendingConfirmation,
} from '@/features/emailConfirmationScreen/pendingConfirmation';
import { useEmailConfirmationPolling } from '@/features/emailConfirmationScreen/useEmailConfirmationPolling';

export function EmailConfirmationScreen() {
  const router = useRouter();
  const session = useSession();
  const [credentials] = useState(getPendingConfirmation);

  const confirmedResult = useEmailConfirmationPolling(credentials);
  const { secondsLeft, isCoolingDown, restart } = useResendCooldown(30);

  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmedResult !== null;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => subscription.remove();
  }, []);

  if (credentials === null) {
    return <Redirect href={WELCOME_ROUTE} />;
  }

  async function handleContinue() {
    if (confirmedResult === null) {
      return;
    }

    clearPendingConfirmation();
    await session.login(confirmedResult.token, confirmedResult.user);
    router.replace(
      confirmedResult.user.onboardingCompleted ? HOME_ROUTE : ONBOARDING_FIRST_STEP_ROUTE,
    );
  }

  function handleBack() {
    clearPendingConfirmation();
    router.replace(WELCOME_ROUTE);
  }

  function handleChangeEmail() {
    clearPendingConfirmation();
    router.replace('/cadastro');
  }

  async function handleResend() {
    if (credentials === null) {
      return;
    }

    setErrorMessage(null);
    setIsResending(true);

    try {
      await resendConfirmationEmail(credentials.email);
      restart();
    } catch {
      setErrorMessage('Não foi possível reenviar agora. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.body}>
        <OnboardingHeader step={1} onPressBack={handleBack} />

        <View style={styles.content}>
          <StatusBadge variant={isConfirmed ? 'confirmed' : 'pending'} />

          <Text style={styles.title}>
            {isConfirmed ? 'E-mail confirmado' : 'Confirme seu e-mail'}
          </Text>

          {isConfirmed ? (
            <Text style={styles.subtitle}>
              Tudo certo com <Text style={styles.email}>{credentials.email}</Text>. Seu cadastro
              está quase completo — faltam só mais algumas informações.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Enviamos um link para <Text style={styles.email}>{credentials.email}</Text>. Toque
              nele para confirmar seu cadastro — ele te traz de volta para cá.
            </Text>
          )}

          {isConfirmed ? null : <HelpCard onPressChangeEmail={handleChangeEmail} />}
        </View>

        <View style={styles.actions}>
          {!isConfirmed && errorMessage ? (
            <Text accessibilityRole="alert" style={styles.formError}>
              {errorMessage}
            </Text>
          ) : null}

          {isConfirmed ? (
            <Button onPress={handleContinue} size="lg">
              Continuar
            </Button>
          ) : (
            <Button disabled={isCoolingDown} loading={isResending} onPress={handleResend} size="lg">
              {isCoolingDown ? `Reenviar em ${secondsLeft}s` : 'Reenviar e-mail'}
            </Button>
          )}
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
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    marginTop: spacing.xxl,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  email: {
    color: colors.text,
    fontFamily: fontFamily.extraBold,
  },
  actions: {
    paddingTop: spacing.lg,
  },
  formError: {
    ...typography.footnote,
    color: colors.danger,
    textAlign: 'center',
  },
});
