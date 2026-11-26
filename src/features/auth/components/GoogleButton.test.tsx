import { fireEvent, render, screen } from '@testing-library/react-native';

import { GoogleButton } from '@/features/auth/components/GoogleButton';

describe('GoogleButton', () => {
  it('mostra o rótulo e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<GoogleButton onPress={onPress} />);

    expect(screen.getByText('Continuar com Google')).toBeOnTheScreen();
    expect(screen.getByText('G')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('google-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fica desabilitado quando disabled', async () => {
    const onPress = jest.fn();
    await render(<GoogleButton disabled onPress={onPress} />);

    expect(screen.getByTestId('google-button')).toBeDisabled();
    await fireEvent.press(screen.getByTestId('google-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('mostra o carregamento no lugar do rótulo e bloqueia o toque', async () => {
    const onPress = jest.fn();
    await render(<GoogleButton loading onPress={onPress} />);

    const button = screen.getByTestId('google-button');
    expect(screen.queryByText('Continuar com Google')).toBeNull();
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
  });

  it('aplica o estilo de pressionado só quando liberado', async () => {
    await render(<GoogleButton onPress={jest.fn()} />);
    const button = screen.getByTestId('google-button');

    await fireEvent(button, 'pressIn');
    await fireEvent(button, 'pressOut');
    expect(button).toBeEnabled();
  });
});
