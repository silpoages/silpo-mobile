import { apiRequest } from '@/services/apiClient';
import {
  GENDER_OPTIONS,
  deleteCurrentUser,
  getUserPreferences,
  updateCurrentUser,
  updateUserPreferences,
} from '@/services/user';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));

const mockApiRequest = jest.mocked(apiRequest);

beforeEach(() => {
  mockApiRequest.mockReset();
});

describe('user service', () => {
  it('lista as opções de gênero na ordem do Figma', () => {
    expect(GENDER_OPTIONS.map((option) => option.label)).toEqual([
      'Homem',
      'Mulher',
      'Não-binário',
      'Outro',
      'Prefiro não informar',
    ]);
  });

  it('deleteCurrentUser chama DELETE /users/{id}', async () => {
    mockApiRequest.mockResolvedValue({ message: 'ok' });

    await expect(deleteCurrentUser('tok', 'u1')).resolves.toBeUndefined();
    expect(mockApiRequest).toHaveBeenCalledWith('/users/u1', { method: 'DELETE', token: 'tok' });
  });

  it('updateCurrentUser envia snake_case e converte a resposta', async () => {
    mockApiRequest.mockResolvedValue({
      full_name: 'Ana',
      birth_date: '2000-01-02',
      gender: 'FEMALE',
      email: 'ana@x.com',
      daily_reminder_enabled: true,
      onboarding_completed: true,
    });

    const result = await updateCurrentUser('tok', {
      fullName: 'Ana',
      birthDate: '2000-01-02',
      gender: 'FEMALE',
      dailyReminderEnabled: true,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/users', {
      method: 'PATCH',
      token: 'tok',
      body: {
        full_name: 'Ana',
        birth_date: '2000-01-02',
        gender: 'FEMALE',
        daily_reminder_enabled: true,
      },
    });
    expect(result).toEqual({
      fullName: 'Ana',
      birthDate: '2000-01-02',
      gender: 'FEMALE',
      email: 'ana@x.com',
      dailyReminderEnabled: true,
      onboardingCompleted: true,
    });
  });

  it('getUserPreferences lê as preferências da conta', async () => {
    mockApiRequest.mockResolvedValue({ daily_reminder_enabled: false });

    await expect(getUserPreferences('tok')).resolves.toEqual({ dailyReminderEnabled: false });
    expect(mockApiRequest).toHaveBeenCalledWith('/users/me/preferences', { token: 'tok' });
  });

  it('updateUserPreferences envia só a preferência', async () => {
    mockApiRequest.mockResolvedValue({ daily_reminder_enabled: true });

    await expect(updateUserPreferences('tok', { dailyReminderEnabled: true })).resolves.toEqual({
      dailyReminderEnabled: true,
    });
    expect(mockApiRequest).toHaveBeenCalledWith('/users/me/preferences', {
      method: 'PATCH',
      token: 'tok',
      body: { daily_reminder_enabled: true },
    });
  });

  it('propaga erros da API', async () => {
    mockApiRequest.mockRejectedValue(new Error('falhou'));
    await expect(getUserPreferences('tok')).rejects.toThrow('falhou');
  });
});
