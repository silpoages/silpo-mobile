import { render, screen } from '@testing-library/react-native';
import { makeSession, withOnboarding } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';

import OnboardingStep1Route from '../../../app/onboarding/etapa-1';
import OnboardingStep2Route from '../../../app/onboarding/etapa-2';
import OnboardingStep3Route from '../../../app/onboarding/etapa-3';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/notifications/dailyReminder', () => ({ scheduleDailyReminder: jest.fn() }));

const profileSaved = (state: { setIsProfileSaved: (value: boolean) => void }) =>
  state.setIsProfileSaved(true);

beforeEach(() => {
  jest.mocked(useSession).mockReturnValue(makeSession());
});

describe('rotas do onboarding', () => {
  it('/onboarding/etapa-1 renderiza a etapa do perfil', async () => {
    await render(withOnboarding(<OnboardingStep1Route />));
    expect(screen.getByText('Como você gostaria de ser chamado?')).toBeTruthy();
  });

  it('/onboarding/etapa-2 renderiza a pessoa de conforto', async () => {
    await render(withOnboarding(<OnboardingStep2Route />, profileSaved));
    expect(screen.getByText('Quem é sua pessoa de conforto?')).toBeTruthy();
  });

  it('/onboarding/etapa-3 renderiza o lembrete diário', async () => {
    await render(withOnboarding(<OnboardingStep3Route />, profileSaved));
    expect(screen.getByText('Podemos te lembrar com carinho?')).toBeTruthy();
  });
});
