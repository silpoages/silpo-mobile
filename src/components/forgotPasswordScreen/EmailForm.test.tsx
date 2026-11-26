import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import EmailForm from '@/components/forgotPasswordScreen/EmailForm';

describe('EmailForm', () => {
  it('repassa a digitação e o envio', async () => {
    const onChangeEmail = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <EmailForm email="ana@silpo.com" onChangeEmail={onChangeEmail} onSubmit={onSubmit} />,
    );

    const field = screen.getByTestId('email-field');
    expect(field).toHaveDisplayValue('ana@silpo.com');

    await fireEvent.changeText(field, 'outro@silpo.com');
    expect(onChangeEmail).toHaveBeenCalledWith('outro@silpo.com');

    await fireEvent(field, 'submitEditing');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('mostra o erro e o carregamento', async () => {
    await render(
      <EmailForm
        email=""
        error="Erro aqui"
        isSubmitting
        onChangeEmail={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText('Erro aqui')).toBeOnTheScreen();
    expect(screen.getByTestId('submit-button')).toBeBusy();
  });

  it('volta para o login', async () => {
    await render(<EmailForm email="" onChangeEmail={jest.fn()} onSubmit={jest.fn()} />);

    await fireEvent.press(screen.getByRole('link', { name: 'Entrar' }));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith('/login');
  });
});
