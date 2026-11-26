import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeSessionValue, makeSignInResult } from '@test/auth-helpers';
import { mockRouter } from '@test/mocks/expoRouter';

import { SignInScreen } from '@/features/auth/SignInScreen';
import { signIn } from '@/features/auth/services/authService';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  clearPendingConfirmation,
  getPendingConfirmation,
} from '@/features/emailConfirmationScreen/pendingConfirmation';
import { ApiError } from '@/services/apiClient';

jest.mock('@/features/auth/services/authService', () => ({ signIn: jest.fn() }));
jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));

const mockedSignIn = jest.mocked(signIn);
let session: ReturnType<typeof makeSessionValue>;

async function fillAndSubmit(email = 'ana@silpo.com', password = 'segredo') {
  await fireEvent.changeText(screen.getByTestId('email-field'), email);
  await fireEvent.changeText(screen.getByTestId('password-field'), password);
  await fireEvent.press(screen.getByTestId('submit-button'));
}

describe('SignInScreen', () => {
  beforeEach(async () => {
    mockedSignIn.mockReset();
    clearPendingConfirmation();
    session = makeSessionValue();
    jest.mocked(useSession).mockReturnValue(session);
    await render(<SignInScreen />);
  });

  it('mostra o formulário de login', () => {
    expect(screen.getByText('Que bom te ver de novo')).toBeOnTheScreen();
    expect(screen.getByText('Entrar')).toBeOnTheScreen();
  });

  it('valida os campos antes de enviar', async () => {
    await fireEvent.press(screen.getByTestId('submit-button'));

    expect(screen.getByText('O e-mail é obrigatório.')).toBeOnTheScreen();
    expect(screen.getByText('A senha é obrigatória.')).toBeOnTheScreen();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it('entra e vai para a Home quando o onboarding já foi feito', async () => {
    const result = makeSignInResult({ user: { onboardingCompleted: true } });
    mockedSignIn.mockResolvedValueOnce(result);

    await fillAndSubmit();

    expect(mockedSignIn).toHaveBeenCalledWith({ email: 'ana@silpo.com', password: 'segredo' });
    expect(session.login).toHaveBeenCalledWith(result.token, result.user);
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('entra e vai para o onboarding quando ainda não foi feito', async () => {
    mockedSignIn.mockResolvedValueOnce(makeSignInResult());

    await fillAndSubmit();

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/etapa-1');
  });

  it('envia ao pressionar "go" no campo de senha', async () => {
    mockedSignIn.mockResolvedValueOnce(makeSignInResult());

    await fireEvent.changeText(screen.getByTestId('email-field'), 'ana@silpo.com');
    await fireEvent.changeText(screen.getByTestId('password-field'), 'segredo');
    await fireEvent(screen.getByTestId('password-field'), 'submitEditing');

    expect(mockedSignIn).toHaveBeenCalled();
  });

  it('abre a confirmação de e-mail quando o login diz que não está confirmado', async () => {
    mockedSignIn.mockResolvedValueOnce(makeSignInResult({ isEmailConfirmed: false }));

    await fillAndSubmit();

    expect(session.login).not.toHaveBeenCalled();
    expect(getPendingConfirmation()).toEqual({ email: 'ana@silpo.com', password: 'segredo' });
    expect(mockRouter.replace).toHaveBeenCalledWith('/confirmar-email');
  });

  it('abre a confirmação de e-mail quando a API responde 403', async () => {
    mockedSignIn.mockRejectedValueOnce(new ApiError(403, 'Forbidden'));

    await fillAndSubmit();

    expect(getPendingConfirmation()).not.toBeNull();
    expect(mockRouter.replace).toHaveBeenCalledWith('/confirmar-email');
  });

  it('mostra erro de credenciais', async () => {
    mockedSignIn.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));

    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('volta pelo histórico quando possível', async () => {
    await fireEvent.press(screen.getByTestId('back-button'));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('volta para a Welcome sem histórico', async () => {
    mockRouter.canGoBack.mockReturnValue(false);

    await fireEvent.press(screen.getByTestId('back-button'));

    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/welcome');
  });

  it('leva à recuperação de senha e ao cadastro', async () => {
    await fireEvent.press(screen.getByRole('link', { name: 'Esqueceu a senha?' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/esqueci-senha');

    await fireEvent.press(screen.getByRole('link', { name: 'Cadastre-se' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/cadastro');
  });
});
