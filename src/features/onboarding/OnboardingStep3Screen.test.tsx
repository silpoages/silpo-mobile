import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { TEST_USER, makeSession, withOnboarding } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import { scheduleDailyReminder } from '@/features/notifications/dailyReminder';
import { getReminderTime } from '@/features/notifications/reminderSettings';
import type { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { ApiError } from '@/services/apiClient';
import { updateCurrentUser, type CurrentUser } from '@/services/user';

import { OnboardingStep3Screen } from '@/features/onboarding/OnboardingStep3Screen';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/services/user', () => ({ updateCurrentUser: jest.fn() }));
jest.mock('@/features/notifications/dailyReminder', () => ({ scheduleDailyReminder: jest.fn() }));
jest.mock('@/features/notifications/reminderSettings', () => ({ getReminderTime: jest.fn() }));

const mockUseSession = jest.mocked(useSession);
const mockUpdateUser = jest.mocked(updateCurrentUser);
const mockSchedule = jest.mocked(scheduleDailyReminder);
const mockGetReminderTime = jest.mocked(getReminderTime);

type OnboardingState = ReturnType<typeof useOnboarding>;

const completedProfile = (state: OnboardingState) => {
  state.setFullName('  Ana  ');
  state.setBirthDate(new Date(1990, 9, 10));
  state.setGender('FEMALE');
  state.setIsProfileSaved(true);
};

function updatedUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    fullName: 'Ana',
    birthDate: '1990-10-10',
    gender: 'FEMALE',
    email: TEST_USER.email,
    dailyReminderEnabled: true,
    onboardingCompleted: true,
    ...overrides,
  };
}

const originalOS = Platform.OS;
let session: ReturnType<typeof makeSession>;

beforeEach(() => {
  jest.clearAllMocks();
  session = makeSession();
  mockUseSession.mockReturnValue(session);
  mockGetReminderTime.mockResolvedValue({ hour: 20, minute: 0 });
  mockSchedule.mockResolvedValue('scheduled');
});

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
});

describe('OnboardingStep3Screen', () => {
  it('volta para a etapa 1 quando o perfil não foi preenchido', async () => {
    await render(withOnboarding(<OnboardingStep3Screen />));
    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding/etapa-1');
  });

  it('mostra a etapa 4 de 4 com o lembrete ativo e volta pelo cabeçalho', async () => {
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    expect(screen.getByText('Podemos te lembrar com carinho?')).toBeTruthy();
    expect(screen.getByText('4 de 4')).toBeTruthy();
    expect(screen.getByTestId('daily-reminder-switch')).toBeChecked();

    await fireEvent.press(screen.getByTestId('back-button'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('conclui com lembrete: salva o perfil, atualiza a sessão, agenda e vai para a Home', async () => {
    mockUpdateUser.mockResolvedValue(updatedUser());
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
    expect(mockUpdateUser).toHaveBeenCalledWith('token-123', {
      fullName: 'Ana',
      birthDate: '1990-10-10',
      gender: 'FEMALE',
      dailyReminderEnabled: true,
    });
    expect(session.login).toHaveBeenCalledWith('token-123', {
      ...TEST_USER,
      fullName: 'Ana',
      onboardingCompleted: true,
    });
    expect(mockSchedule).toHaveBeenCalledWith({ hour: 20, minute: 0 }, { askPermission: true });
  });

  it('não trava o cadastro se o agendamento falhar', async () => {
    mockUpdateUser.mockResolvedValue(updatedUser());
    mockSchedule.mockRejectedValue(new Error('sem permissão'));
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('conclui com o lembrete desligado pelo switch, sem agendar', async () => {
    mockUpdateUser.mockResolvedValue(updatedUser({ dailyReminderEnabled: false }));
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent(screen.getByTestId('daily-reminder-switch'), 'valueChange', false);
    expect(screen.getByTestId('daily-reminder-switch')).not.toBeChecked();

    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
    expect(mockUpdateUser).toHaveBeenCalledWith(
      'token-123',
      expect.objectContaining({ dailyReminderEnabled: false }),
    );
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('usa o thumb claro no Android com o lembrete ativo', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    expect(screen.getByTestId('daily-reminder-switch').props.thumbTintColor).toBe('#FFFFFF');
  });

  it('"Pular esta etapa" conclui com o lembrete desligado', async () => {
    mockUpdateUser.mockResolvedValue(updatedUser({ dailyReminderEnabled: false }));
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent.press(screen.getByTestId('skip-button'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
    expect(mockUpdateUser).toHaveBeenCalledWith(
      'token-123',
      expect.objectContaining({ dailyReminderEnabled: false }),
    );
  });

  it('mostra a mensagem da API quando salvar falha', async () => {
    mockUpdateUser.mockRejectedValue(new ApiError(422, 'Data inválida'));
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent.press(screen.getByTestId('finish-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Data inválida');
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(session.login).not.toHaveBeenCalled();
  });

  it('mostra mensagem genérica em erro inesperado', async () => {
    mockUpdateUser.mockRejectedValue(new Error('rede'));
    await render(withOnboarding(<OnboardingStep3Screen />, completedProfile));

    await fireEvent.press(screen.getByTestId('finish-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar agora. Tente novamente.',
    );
  });

  it('não envia quando faltam dados da sessão ou do perfil', async () => {
    mockUseSession.mockReturnValue(makeSession({ user: null }));
    await render(
      withOnboarding(<OnboardingStep3Screen />, (state) => state.setIsProfileSaved(true)),
    );

    await fireEvent.press(screen.getByTestId('finish-button'));

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
