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

export function EmailConfirmationScreen() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const session = useSession();
  const email = session.user?.email ?? '';
  const { secondsLeft, isCoolingDown, restart } = useResendCooldown(30);

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
          {isConfirmed ? (
            <Button onPress={() => {}} size="lg">
              Continuar
            </Button>
          ) : (
            <Button disabled={isCoolingDown} onPress={() => {}} size="lg">
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
});
