import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import Button from '@/components/Button';

describe('Button', () => {
  it('renderiza o texto e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<Button onPress={onPress}>Salvar</Button>);

    const button = screen.getByRole('button', { name: 'Salvar' });
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).not.toBeDisabled();
  });

  it.each(['primary', 'secondary', 'support', 'supportText', 'ghost'] as const)(
    'renderiza a variante %s',
    async (variant) => {
      await render(
        <Button variant={variant} size="sm" shape="pill">
          Ok
        </Button>,
      );

      expect(screen.getByText('Ok')).toBeOnTheScreen();
    },
  );

  it('renderiza o ícone à esquerda', async () => {
    await render(
      <Button size="lg" leftIcon={<Text>ícone</Text>}>
        Com ícone
      </Button>,
    );

    expect(screen.getByText('ícone')).toBeOnTheScreen();
    expect(screen.getByText('Com ícone')).toBeOnTheScreen();
  });

  it('fica desabilitado e não chama onPress quando disabled', async () => {
    const onPress = jest.fn();
    await render(
      <Button disabled onPress={onPress}>
        Bloqueado
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('mostra o indicador e esconde o texto enquanto carrega', async () => {
    const onPress = jest.fn();
    await render(
      <Button loading onPress={onPress}>
        Enviar
      </Button>,
    );

    expect(screen.queryByText('Enviar')).not.toBeOnTheScreen();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
