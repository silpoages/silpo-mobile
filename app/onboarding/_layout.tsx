import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';

import { useSession } from '@/features/auth/session/SessionContext';
import { HOME_ROUTE } from '@/features/auth/session/routeAccess';
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';

/** Compartilha o estado das 3 etapas (`OnboardingContext`) entre as rotas irmãs. */
export default function OnboardingLayout() {
  const session = useSession();

  /**
   * `PATCH /users` marca `onboarding_completed` já na etapa 1, então só o valor
   * de quando o grupo montou distingue "no meio do fluxo" de "já concluído".
   */
  const [hadCompletedOnboardingOnEntry] = useState(
    () => session.user?.onboardingCompleted ?? false,
  );

  if (hadCompletedOnboardingOnEntry) {
    return <Redirect href={HOME_ROUTE} />;
  }

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="etapa-1" />
        <Stack.Screen name="etapa-2" />
        <Stack.Screen name="etapa-3" />
      </Stack>
    </OnboardingProvider>
  );
}
