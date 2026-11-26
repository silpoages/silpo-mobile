import { fireEvent, render, screen } from '@testing-library/react-native';

import NewPasswordForm from '@/components/forgotPasswordScreen/NewPasswordForm';

describe('NewPasswordForm', () => {
  it('repassa digitação, envio e mostra os erros', async () => {
    const onChangePassword = jest.fn();
    const onChangePasswordConfirmation = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <NewPasswordForm
        confirmationError="Não coincidem"
        onChangePassword={onChangePassword}
        onChangePasswordConfirmation={onChangePasswordConfirmation}
        onSubmit={onSubmit}
        password="a"
        passwordConfirmation="b"
        passwordError="Curta"
      />,
    );

    expect(screen.getByText('Curta')).toBeOnTheScreen();
    expect(screen.getByText('Não coincidem')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('new-password-field'), 'nova');
    expect(onChangePassword).toHaveBeenCalledWith('nova');

    await fireEvent.changeText(screen.getByTestId('password-confirmation-field'), 'nova');
    expect(onChangePasswordConfirmation).toHaveBeenCalledWith('nova');

    await fireEvent(screen.getByTestId('password-confirmation-field'), 'submitEditing');
    await fireEvent.press(screen.getByRole('button', { name: 'Redefinir senha' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('mostra o carregamento ao enviar', async () => {
    await render(
      <NewPasswordForm
        isSubmitting
        onChangePassword={jest.fn()}
        onChangePasswordConfirmation={jest.fn()}
        onSubmit={jest.fn()}
        password=""
        passwordConfirmation=""
      />,
    );

    expect(screen.getByTestId('submit-button')).toBeBusy();
  });
});
