import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeSessionValue, makeSignInResult } from '@test/auth-helpers';
import { mockRouter } from '@test/mocks/expoRouter';

import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { register } from '@/features/auth/services/authService';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  clearPendingConfirmation,
  getPendingConfirmation,
} from '@/features/emailConfirmationScreen/pendingConfirmation';
import { ApiError } from '@/services/apiClient';

jest.mock('@/features/auth/services/authService', () => ({ register: jest.fn() }));
jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));

const mockedRegister = jest.mocked(register);
let session: ReturnType<typeof makeSessionValue>;

async function fillAndSubmit(email = 'ana@silpo.com', password = 'segredo123') {
  await fireEvent.changeText(screen.getByTestId('email-field'), email);
  await fireEvent.changeText(screen.getByTestId('password-field'), password);
  await fireEvent.press(screen.getByTestId('submit-button'));
}

describe('RegisterScreen', () => {
  beforeEach(async () => {
    mockedRegister.mockReset();
    clearPendingConfirmation();
    session = makeSessionValue();
    jest.mocked(useSession).mockReturnValue(session);
    await render(<RegisterScreen />);
  });

  it('mostra o formulário de cadastro', () => {
    expect(screen.getByText('Vamos começar juntos')).toBeOnTheScreen();
    expect(screen.getByText('Criar conta')).toBeOnTheScreen();
  });

  it('exige senha com pelo menos 8 caracteres', async () => {
    await fillAndSubmit('ana@silpo.com', 'curta');

    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('cadastra, entra e vai para o onboarding', async () => {
    const result = makeSignInResult();
    mockedRegister.mockResolvedValueOnce(result);

    await fillAndSubmit();

    expect(mockedRegister).toHaveBeenCalledWith({ email: 'ana@silpo.com', password: 'segredo123' });
    expect(session.login).toHaveBeenCalledWith(result.token, result.user);
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/etapa-1');
  });

  it('envia ao pressionar "go" no campo de senha', async () => {
    mockedRegister.mockResolvedValueOnce(makeSignInResult());

    await fireEvent.changeText(screen.getByTestId('email-field'), 'ana@silpo.com');
    await fireEvent.changeText(screen.getByTestId('password-field'), 'segredo123');
    await fireEvent(screen.getByTestId('password-field'), 'submitEditing');

    expect(mockedRegister).toHaveBeenCalled();
  });

  it('abre a confirmação de e-mail quando o e-mail não está confirmado', async () => {
    mockedRegister.mockResolvedValueOnce(makeSignInResult({ isEmailConfirmed: false }));

    await fillAndSubmit();

    expect(session.login).not.toHaveBeenCalled();
    expect(getPendingConfirmation()).toEqual({ email: 'ana@silpo.com', password: 'segredo123' });
    expect(mockRouter.replace).toHaveBeenCalledWith('/confirmar-email');
  });

  it('abre a confirmação de e-mail quando o login após cadastro responde 403', async () => {
    mockedRegister.mockRejectedValueOnce(new ApiError(403, 'Forbidden'));

    await fillAndSubmit();

    expect(mockRouter.replace).toHaveBeenCalledWith('/confirmar-email');
  });

  it('avisa quando o e-mail já está cadastrado', async () => {
    mockedRegister.mockRejectedValueOnce(new ApiError(409, 'Conflict'));

    await fillAndSubmit();

    expect(screen.getByRole('alert')).toHaveTextContent('Este e-mail já está cadastrado.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('volta e leva ao login', async () => {
    await fireEvent.press(screen.getByTestId('back-button'));
    expect(mockRouter.back).toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('link', { name: 'Entrar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/login');
  });
});
