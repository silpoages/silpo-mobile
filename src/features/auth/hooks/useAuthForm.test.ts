import { act, renderHook } from '@testing-library/react-native';

import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { validateNewPassword } from '@/features/auth/validation/authValidation';
import { ApiError } from '@/services/apiClient';

async function setup(onSubmit = jest.fn().mockResolvedValue(undefined), strict = false) {
  const hook = await renderHook(() =>
    useAuthForm(strict ? { onSubmit, validatePassword: validateNewPassword } : { onSubmit }),
  );
  return { ...hook, onSubmit };
}

describe('useAuthForm', () => {
  it('valida os campos no envio sem chamar onSubmit', async () => {
    const { result, onSubmit } = await setup();

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors).toEqual({
      email: 'O e-mail é obrigatório.',
      password: 'A senha é obrigatória.',
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('limpa o erro do campo assim que o usuário volta a digitar', async () => {
    const { result } = await setup();

    await act(async () => {
      await result.current.handleSubmit();
    });
    await act(async () => {
      result.current.handleEmailChange('ana@silpo.com');
    });
    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBe('A senha é obrigatória.');

    await act(async () => {
      result.current.handlePasswordChange('x');
    });
    expect(result.current.errors.password).toBeUndefined();
    expect(result.current.email).toBe('ana@silpo.com');
    expect(result.current.password).toBe('x');
  });

  it('usa a regra de senha informada', async () => {
    const { result } = await setup(undefined, true);

    await act(async () => {
      result.current.handleEmailChange('ana@silpo.com');
      result.current.handlePasswordChange('curta');
    });
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.password).toBe('A senha deve ter pelo menos 8 caracteres.');
  });

  it('envia o e-mail sem espaços e controla isSubmitting', async () => {
    let finish: () => void = () => {};
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = await setup(onSubmit);

    await act(async () => {
      result.current.handleEmailChange('  ana@silpo.com ');
      result.current.handlePasswordChange('segredo');
    });

    let submitPromise: Promise<void> = Promise.resolve();
    await act(async () => {
      submitPromise = result.current.handleSubmit();
    });
    expect(result.current.isSubmitting).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@silpo.com', password: 'segredo' });

    await act(async () => {
      finish();
      await submitPromise;
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it.each([
    [new ApiError(401, 'Unauthorized'), 'E-mail ou senha incorretos.'],
    [new ApiError(409, 'Conflict'), 'Este e-mail já está cadastrado.'],
    [new ApiError(500, 'Server'), 'Não foi possível concluir agora. Tente novamente.'],
    [new Error('rede'), 'Não foi possível concluir agora. Tente novamente.'],
  ])('mostra a mensagem do erro %p no formulário', async (error, message) => {
    const { result } = await setup(jest.fn().mockRejectedValue(error));

    await act(async () => {
      result.current.handleEmailChange('ana@silpo.com');
      result.current.handlePasswordChange('segredo');
    });
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.form).toBe(message);
    expect(result.current.isSubmitting).toBe(false);

    await act(async () => {
      result.current.handlePasswordChange('outra');
    });
    expect(result.current.errors.form).toBeUndefined();
  });
});
