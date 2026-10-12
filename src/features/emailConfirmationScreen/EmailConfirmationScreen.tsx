import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { HelpCard } from '@/components/emailConfirmationScreen/HelpCard';
import { StatusBadge } from '@/components/emailConfirmationScreen/StatusBadge';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, fontFamily, fontSize, spacing, typography } from '@/theme';
import { useSession } from '@/features/auth/session/SessionContext';
import { useResendCooldown } from '@/features/emailConfirmationScreen/useResendCooldown';
import { resendConfirmationEmail } from '@/features/emailConfirmationScreen/emailConfirmationServices';

export function EmailConfirmationScreen() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const session = useSession();
  const email = session.user?.email ?? '';
  const { secondsLeft, isCoolingDown, restart } = useResendCooldown(30);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleResend() {
    setErrorMessage(null);
    setIsResending(true);

    try {
      await resendConfirmationEmail(email);
      restart();
    } catch {
      setErrorMessage('Não foi possível reenviar agora. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <OnboardingHeader step={4} />

        <View style={styles.content}>
          <StatusBadge variant={isConfirmed ? 'confirmed' : 'pending'} />

          <Text style={styles.title}>
            {isConfirmed ? 'E-mail confirmado' : 'Confirme seu e-mail'}
          </Text>

          {isConfirmed ? (
            <Text style={styles.subtitle}>
              Tudo certo com <Text style={styles.email}>{email}</Text>. Seu cadastro está completo —
              falta só um último detalhe.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Enviamos um link para <Text style={styles.email}>{email}</Text>. Toque nele para
              confirmar seu cadastro — ele te traz de volta para cá.
            </Text>
          )}

          {isConfirmed ? null : <HelpCard onPressChangeEmail={() => {}} />}
        </View>

        <View style={styles.actions}>
          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.formError}>
              {errorMessage}
            </Text>
          ) : null}

          <Button disabled={isCoolingDown} loading={isResending} onPress={handleResend} size="lg">
            {isCoolingDown ? `Reenviar em ${secondsLeft}s` : 'Reenviar e-mail'}
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
