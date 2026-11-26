import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '@/components/TextField';

describe('TextField', () => {
  it('mostra o rótulo e repassa a digitação', async () => {
    const onChangeText = jest.fn();
    const onSubmitEditing = jest.fn();
    await render(
      <TextField
        label="E-mail"
        value=""
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder="seu@email.com"
        testID="email"
      />,
    );

    expect(screen.getByText('E-mail')).toBeOnTheScreen();
    const input = screen.getByLabelText('E-mail');
    await fireEvent.changeText(input, 'a@b.com');
    await fireEvent(input, 'submitEditing');

    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
    expect(onSubmitEditing).toHaveBeenCalled();
    expect(screen.queryByTestId('email-visibility-toggle')).not.toBeOnTheScreen();
  });

  it('usa o placeholder como rótulo acessível quando não há label', async () => {
    await render(<TextField value="" onChangeText={jest.fn()} placeholder="Seu nome" />);

    expect(screen.getByLabelText('Seu nome')).toBeOnTheScreen();
  });

  it('exibe a mensagem de erro como alerta', async () => {
    await render(
      <TextField label="Senha" value="" onChangeText={jest.fn()} errorMessage="Erro!" />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Erro!');
  });

  it('alterna foco e blur sem quebrar', async () => {
    await render(<TextField label="Nome" value="x" onChangeText={jest.fn()} />);
    const input = screen.getByLabelText('Nome');

    await fireEvent(input, 'focus');
    await fireEvent(input, 'blur');

    expect(input).toHaveDisplayValue('x');
  });

  it('alterna a visibilidade da senha', async () => {
    await render(
      <TextField label="Senha" value="123" onChangeText={jest.fn()} secureTextEntry testID="pwd" />,
    );

    const input = screen.getByTestId('pwd');
    expect(input.props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByTestId('pwd').props.secureTextEntry).toBe(false);
    expect(screen.getByTestId('pwd-visibility-toggle')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(screen.getByTestId('pwd').props.secureTextEntry).toBe(true);
  });

  it('não define testID do botão de visibilidade sem testID do campo', async () => {
    await render(<TextField label="Senha" value="" onChangeText={jest.fn()} secureTextEntry />);

    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeOnTheScreen();
  });
});
