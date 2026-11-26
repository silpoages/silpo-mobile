import { fireEvent, render, screen } from '@testing-library/react-native';

import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';

describe('AuthFormFooter', () => {
  it('mostra a pergunta e chama a ação pelo link', async () => {
    const onPressAction = jest.fn();
    await render(
      <AuthFormFooter
        actionLabel="Entrar"
        onPressAction={onPressAction}
        question="Já tem conta?"
      />,
    );

    expect(screen.getByText('Já tem conta?')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link', { name: 'Entrar' }));
    expect(onPressAction).toHaveBeenCalledTimes(1);
  });

  it('omite a pergunta quando não informada', async () => {
    await render(<AuthFormFooter actionLabel="Esqueceu a senha?" onPressAction={jest.fn()} />);

    expect(screen.getByText('Esqueceu a senha?')).toBeOnTheScreen();
    expect(screen.queryByText('Já tem conta?')).toBeNull();
  });
});
