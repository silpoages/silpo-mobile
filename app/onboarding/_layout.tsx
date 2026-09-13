import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';

/** Compartilha o estado das 3 etapas (`OnboardingContext`) entre as rotas irmãs. */
export default function OnboardingLayout() {
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
