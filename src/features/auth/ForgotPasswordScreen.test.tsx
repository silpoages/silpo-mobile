import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import { ForgotPasswordScreen } from '@/features/auth/ForgotPasswordScreen';
import {
  requestPasswordResetCode,
  resetPasswordWithCode,
  verifyPasswordResetCode,
} from '@/features/auth/services/passwordResetService';
import { ApiError } from '@/services/apiClient';

jest.mock('@/features/auth/services/passwordResetService', () => ({
  requestPasswordResetCode: jest.fn(),
  verifyPasswordResetCode: jest.fn(),
  resetPasswordWithCode: jest.fn(),
}));

const mockedRequest = jest.mocked(requestPasswordResetCode);
const mockedVerify = jest.mocked(verifyPasswordResetCode);
const mockedReset = jest.mocked(resetPasswordWithCode);

async function submit() {
  await fireEvent.press(screen.getByTestId('submit-button'));
}

async function goToCodeStep(email = ' ana@silpo.com ') {
  await fireEvent.changeText(screen.getByTestId('email-field'), email);
  await submit();
}

async function goToPasswordStep() {
  await goToCodeStep();
  await fireEvent.changeText(screen.getByTestId('code-field'), '123456');
  await submit();
}

async function fillPasswords(password: string, confirmation: string) {
  await fireEvent.changeText(screen.getByTestId('new-password-field'), password);
  await fireEvent.changeText(screen.getByTestId('password-confirmation-field'), confirmation);
}

describe('ForgotPasswordScreen', () => {
  beforeEach(async () => {
    mockedRequest.mockReset().mockResolvedValue(undefined);
    mockedVerify.mockReset().mockResolvedValue(undefined);
    mockedReset.mockReset().mockResolvedValue(undefined);
    await render(<ForgotPasswordScreen />);
  });

  describe('etapa 1 — e-mail', () => {
    it('mostra o cabeçalho inicial', () => {
      expect(screen.getByText('Recupere o acesso à sua conta')).toBeOnTheScreen();
      expect(screen.getByText('Seus dados são privados e ficam com você.')).toBeOnTheScreen();
    });

    it('valida o e-mail e limpa o erro ao digitar', async () => {
      await submit();
      expect(screen.getByText('O e-mail é obrigatório.')).toBeOnTheScreen();
      expect(mockedRequest).not.toHaveBeenCalled();

      await fireEvent.changeText(screen.getByTestId('email-field'), 'a');
      expect(screen.queryByText('O e-mail é obrigatório.')).toBeNull();
    });

    it('avisa quando o envio do código falha', async () => {
      mockedRequest.mockRejectedValueOnce(new Error('rede'));

      await goToCodeStep();

      expect(
        screen.getByText('Não foi possível enviar o código. Tente novamente.'),
      ).toBeOnTheScreen();
      expect(screen.getByTestId('email-field')).toBeOnTheScreen();
    });

    it('envia o código e avança para a verificação', async () => {
      await goToCodeStep();

      expect(mockedRequest).toHaveBeenCalledWith('ana@silpo.com');
      expect(screen.getByText('Verifique seu e-mail')).toBeOnTheScreen();
      expect(
        screen.getByText('Digite o código de 6 dígitos enviado para ana@silpo.com.'),
      ).toBeOnTheScreen();
    });

    it('volta para o login', async () => {
      await fireEvent.press(screen.getByTestId('back-button'));

      expect(mockRouter.dismissTo).toHaveBeenCalledWith('/login');
    });
  });

  describe('etapa 2 — código', () => {
    beforeEach(async () => {
      await goToCodeStep();
    });

    it('aceita só dígitos e no máximo 6', async () => {
      await fireEvent.changeText(screen.getByTestId('code-field'), '12a3-45678');

      expect(screen.getByTestId('code-field')).toHaveDisplayValue('123456');
    });

    it('exige o código completo', async () => {
      await fireEvent.changeText(screen.getByTestId('code-field'), '123');
      await submit();

      expect(screen.getByText('Digite o código de 6 dígitos.')).toBeOnTheScreen();
      expect(mockedVerify).not.toHaveBeenCalled();
    });

    it('avisa código inválido (400)', async () => {
      mockedVerify.mockRejectedValueOnce(new ApiError(400, 'Bad'));
      await fireEvent.changeText(screen.getByTestId('code-field'), '123456');
      await submit();

      expect(screen.getByText('Código inválido ou expirado.')).toBeOnTheScreen();
    });

    it('avisa falha genérica ao verificar', async () => {
      mockedVerify.mockRejectedValueOnce(new ApiError(500, 'Server'));
      await fireEvent.changeText(screen.getByTestId('code-field'), '123456');
      await submit();

      expect(
        screen.getByText('Não foi possível verificar o código. Tente novamente.'),
      ).toBeOnTheScreen();
    });

    it('verifica o código e avança para a nova senha', async () => {
      await fireEvent.changeText(screen.getByTestId('code-field'), '123456');
      await submit();

      expect(mockedVerify).toHaveBeenCalledWith('ana@silpo.com', '123456');
      expect(screen.getByText('Crie uma nova senha')).toBeOnTheScreen();
    });

    it('volta para a etapa do e-mail', async () => {
      await fireEvent.press(screen.getByTestId('back-button'));

      expect(screen.getByText('Recupere o acesso à sua conta')).toBeOnTheScreen();
      expect(mockRouter.dismissTo).not.toHaveBeenCalled();
    });
  });

  describe('etapa 3 — nova senha', () => {
    beforeEach(async () => {
      await goToPasswordStep();
    });

    it('valida a nova senha', async () => {
      await fillPasswords('curta', 'curta');
      await submit();

      expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen();

      await fireEvent.changeText(screen.getByTestId('new-password-field'), 'segredo123');
      expect(screen.queryByText('A senha deve ter pelo menos 8 caracteres.')).toBeNull();
    });

    it('exige a confirmação', async () => {
      await fillPasswords('segredo123', '');
      await submit();

      expect(screen.getByText('Confirme sua nova senha.')).toBeOnTheScreen();

      await fireEvent.changeText(screen.getByTestId('password-confirmation-field'), 'x');
      expect(screen.queryByText('Confirme sua nova senha.')).toBeNull();
    });

    it('exige senhas iguais', async () => {
      await fillPasswords('segredo123', 'segredo124');
      await submit();

      expect(screen.getByText('As senhas não coincidem.')).toBeOnTheScreen();
      expect(mockedReset).not.toHaveBeenCalled();
    });

    it('volta para a etapa 2 quando o código expirou', async () => {
      mockedReset.mockRejectedValueOnce(new ApiError(400, 'Bad'));
      await fillPasswords('segredo123', 'segredo123');
      await submit();

      expect(screen.getByText('Verifique seu e-mail')).toBeOnTheScreen();
      expect(screen.getByTestId('code-field')).toHaveDisplayValue('');
      expect(
        screen.getByText('Seu código expirou. Toque em "Reenviar código" para receber outro.'),
      ).toBeOnTheScreen();
    });

    it('avisa falha genérica ao redefinir', async () => {
      mockedReset.mockRejectedValueOnce(new Error('rede'));
      await fillPasswords('segredo123', 'segredo123');
      await submit();

      expect(
        screen.getByText('Não foi possível redefinir a senha. Tente novamente.'),
      ).toBeOnTheScreen();
    });

    it('redefine a senha e mostra a confirmação final', async () => {
      await fillPasswords('segredo123', 'segredo123');
      await fireEvent(screen.getByTestId('password-confirmation-field'), 'submitEditing');

      expect(mockedReset).toHaveBeenCalledWith('ana@silpo.com', '123456', 'segredo123');
      expect(screen.getByText('Senha Redefinida com Sucesso!')).toBeOnTheScreen();
      expect(screen.queryByTestId('back-button')).toBeNull();
    });
  });

  it('ignora envios repetidos enquanto o anterior está em andamento', async () => {
    let finish: () => void = () => {};
    mockedRequest.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );

    await fireEvent.changeText(screen.getByTestId('email-field'), 'ana@silpo.com');
    // dispara sem esperar o envio terminar, para o segundo pedido chegar com o primeiro pendente
    await act(async () => {
      void screen.getByTestId('email-field').props.onSubmitEditing();
    });
    await act(async () => {
      void screen.getByTestId('email-field').props.onSubmitEditing();
    });

    expect(mockedRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish();
    });
    expect(screen.getByText('Verifique seu e-mail')).toBeOnTheScreen();
  });
});

describe('ForgotPasswordScreen — reenvio do código', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    mockedRequest.mockReset().mockResolvedValue(undefined);
    await render(<ForgotPasswordScreen />);
    await goToCodeStep();
  });

  afterEach(() => jest.useRealTimers());

  async function waitCooldown() {
    for (let i = 0; i < 60; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }
  }

  it('reenvia o código e reinicia a contagem', async () => {
    await waitCooldown();
    await fireEvent.press(screen.getByRole('link', { name: 'Reenviar código' }));

    expect(mockedRequest).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Reenviar código em 60s')).toBeOnTheScreen();
  });

  it('avisa quando o reenvio falha', async () => {
    mockedRequest.mockRejectedValueOnce(new Error('rede'));

    await waitCooldown();
    await fireEvent.press(screen.getByRole('link', { name: 'Reenviar código' }));

    expect(
      screen.getByText('Não foi possível reenviar o código. Tente novamente.'),
    ).toBeOnTheScreen();
  });
});
