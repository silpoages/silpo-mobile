import { render, screen } from '@testing-library/react-native';
import { makeSession } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import { getUserPreferences } from '@/services/user';

import NotificationsRoute from '../../app/notificacoes';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/services/user', () => ({
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
}));
// Simula a variante web, que não agenda notificações.
jest.mock('@/features/notifications/dailyReminder', () =>
  jest.requireActual('@/features/notifications/dailyReminder.web'),
);

describe('rota /notificacoes', () => {
  it('renderiza a tela e avisa que o navegador não envia o lembrete', async () => {
    jest.mocked(useSession).mockReturnValue(makeSession());
    jest.mocked(getUserPreferences).mockResolvedValue({ dailyReminderEnabled: true });

    await render(<NotificationsRoute />);

    expect(screen.getByRole('header', { name: 'Notificações' })).toBeTruthy();
    expect(
      await screen.findByText(
        'No navegador o lembrete não é enviado. Ele chega pelo app Silpo no seu celular.',
      ),
    ).toBeTruthy();
  });
});
