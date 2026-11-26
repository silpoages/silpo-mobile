import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { makeSessionValue, makeSignInResult } from '@test/auth-helpers';
import { mockRouter } from '@test/mocks/expoRouter';

import { useSession } from '@/features/auth/session/SessionContext';
import { EmailConfirmationScreen } from '@/features/emailConfirmationScreen/EmailConfirmationScreen';
import { resendConfirmationEmail } from '@/features/emailConfirmationScreen/emailConfirmationService';
import {
  clearPendingConfirmation,
  getPendingConfirmation,
  setPendingConfirmation,
} from '@/features/emailConfirmationScreen/pendingConfirmation';
import { useEmailConfirmationPolling } from '@/features/emailConfirmationScreen/useEmailConfirmationPolling';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/emailConfirmationScreen/emailConfirmationService', () => ({
  resendConfirmationEmail: jest.fn(),
}));
jest.mock('@/features/emailConfirmationScreen/useEmailConfirmationPolling', () => ({
  useEmailConfirmationPolling: jest.fn(),
}));

const mockedResend = jest.mocked(resendConfirmationEmail);
const mockedPolling = jest.mocked(useEmailConfirmationPolling);
const credentials = { email: 'ana@silpo.com', password: 'segredo123' };
let session: ReturnType<typeof makeSessionValue>;

async function passSeconds(seconds: number) {
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  }
}

describe('EmailConfirmationScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedResend.mockReset().mockResolvedValue(undefined);
    mockedPolling.mockReset().mockReturnValue(null);
    session = makeSessionValue();
    jest.mocked(useSession).mockReturnValue(session);
    setPendingConfirmation(credentials);
  });

  afterEach(() => {
    clearPendingConfirmation();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('volta para a Welcome sem cadastro pendente', async () => {
    clearPendingConfirmation();

    await render(<EmailConfirmationScreen />);

    expect(screen.getByTestId('redirect')).toHaveTextContent('/welcome');
  });

  it('pede a confirmação enquanto o e-mail não foi confirmado', async () => {
    await render(<EmailConfirmationScreen />);

    expect(mockedPolling).toHaveBeenCalledWith(credentials);
    expect(screen.getByText('Confirme seu e-mail')).toBeOnTheScreen();
    expect(screen.getByText('ana@silpo.com')).toBeOnTheScreen();
    expect(screen.getByText('Reenviar em 30s')).toBeOnTheScreen();
    expect(screen.getByText('1 de 4')).toBeOnTheScreen();
  });

  it('bloqueia o botão voltar do Android', async () => {
    const remove = jest.fn();
    let handler: Parameters<typeof BackHandler.addEventListener>[1] | undefined;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, listener) => {
      handler = listener;
      return { remove };
    });

    const { unmount } = await render(<EmailConfirmationScreen />);

    expect(handler?.({} as never)).toBe(true);
    await unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('reenvia o e-mail depois da contagem e reinicia a contagem', async () => {
    await render(<EmailConfirmationScreen />);

    await passSeconds(30);
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar e-mail' }));

    expect(mockedResend).toHaveBeenCalledWith('ana@silpo.com');
    expect(screen.getByText('Reenviar em 30s')).toBeOnTheScreen();
  });

  it('avisa quando o reenvio falha', async () => {
    mockedResend.mockRejectedValueOnce(new Error('rede'));
    await render(<EmailConfirmationScreen />);

    await passSeconds(30);
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar e-mail' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível reenviar agora. Tente novamente.',
    );
    expect(screen.getByText('Reenviar e-mail')).toBeOnTheScreen();
  });

  it('volta para a Welcome descartando o cadastro pendente', async () => {
    await render(<EmailConfirmationScreen />);

    await fireEvent.press(screen.getByTestId('back-button'));

    expect(getPendingConfirmation()).toBeNull();
    expect(mockRouter.replace).toHaveBeenCalledWith('/welcome');
  });

  it('leva ao cadastro para alterar o e-mail', async () => {
    await render(<EmailConfirmationScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar e-mail' }));

    expect(getPendingConfirmation()).toBeNull();
    expect(mockRouter.replace).toHaveBeenCalledWith('/cadastro');
  });

  describe('com o e-mail confirmado', () => {
    it('mostra a confirmação e segue para o onboarding', async () => {
      const result = makeSignInResult();
      mockedPolling.mockReturnValue(result);
      await render(<EmailConfirmationScreen />);

      expect(screen.getByText('E-mail confirmado')).toBeOnTheScreen();
      expect(screen.queryByText('Alterar e-mail')).toBeNull();

      await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      expect(getPendingConfirmation()).toBeNull();
      expect(session.login).toHaveBeenCalledWith(result.token, result.user);
      expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/etapa-1');
    });

    it('segue para a Home quando o onboarding já foi feito', async () => {
      mockedPolling.mockReturnValue(makeSignInResult({ user: { onboardingCompleted: true } }));
      await render(<EmailConfirmationScreen />);

      await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });
});
