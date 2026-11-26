import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import ChangedPasswordForm from '@/components/forgotPasswordScreen/ChangedPasswordForm';

describe('ChangedPasswordForm', () => {
  it('confirma a troca e volta para o login', async () => {
    await render(<ChangedPasswordForm />);

    expect(screen.getByText('Senha Redefinida com Sucesso!')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para o login' }));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith('/login');
  });
});
