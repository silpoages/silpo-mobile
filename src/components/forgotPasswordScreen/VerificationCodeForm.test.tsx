import { act, fireEvent, render, screen } from '@testing-library/react-native';

import VerificationCodeForm from '@/components/forgotPasswordScreen/VerificationCodeForm';

type Props = Partial<Parameters<typeof VerificationCodeForm>[0]>;

async function renderForm(props: Props = {}) {
  const allProps = {
    code: '',
    onChangeCode: jest.fn(),
    onResendCode: jest.fn().mockResolvedValue(true),
    onSubmit: jest.fn(),
    ...props,
  };
  await render(<VerificationCodeForm {...allProps} />);
  return allProps;
}

async function passSeconds(seconds: number) {
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  }
}

describe('VerificationCodeForm', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('repassa digitação, envio e mostra o erro', async () => {
    const props = await renderForm({ code: '12', error: 'Código inválido' });

    expect(screen.getByTestId('code-field')).toHaveDisplayValue('12');
    expect(screen.getByText('Código inválido')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('code-field'), '123');
    expect(props.onChangeCode).toHaveBeenCalledWith('123');

    await fireEvent(screen.getByTestId('code-field'), 'submitEditing');
    await fireEvent.press(screen.getByRole('button', { name: 'Verificar código' }));
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
  });

  it('só permite reenviar depois da contagem', async () => {
    const props = await renderForm();

    const cooling = screen.getByRole('link', { name: 'Reenviar código em 60s' });
    await fireEvent.press(cooling);
    expect(props.onResendCode).not.toHaveBeenCalled();

    await passSeconds(60);

    await fireEvent.press(screen.getByRole('link', { name: 'Reenviar código' }));
    expect(props.onResendCode).toHaveBeenCalledTimes(1);
    // reenvio deu certo: a contagem recomeça
    expect(screen.getByText('Reenviar código em 60s')).toBeOnTheScreen();
  });

  it('não reinicia a contagem quando o reenvio falha', async () => {
    const props = await renderForm({ onResendCode: jest.fn().mockResolvedValue(false) });

    await passSeconds(60);
    await fireEvent.press(screen.getByRole('link', { name: 'Reenviar código' }));

    expect(props.onResendCode).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Reenviar código')).toBeOnTheScreen();
  });

  it('não reenvia enquanto envia o código', async () => {
    const props = await renderForm({ isSubmitting: true });

    await passSeconds(60);
    await fireEvent.press(screen.getByRole('link', { name: 'Reenviar código' }));

    expect(props.onResendCode).not.toHaveBeenCalled();
  });
});
