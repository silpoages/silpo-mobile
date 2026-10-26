import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/features/auth/session/SessionContext';
import { HOME_ROUTE } from '@/features/auth/session/routeAccess';
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';

/** Compartilha o estado das 3 etapas (`OnboardingContext`) entre as rotas irmãs. */
export default function OnboardingLayout() {
  const session = useSession();
  const onboardingCompleted = session.user?.onboardingCompleted ?? false;

  if (onboardingCompleted) {
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
