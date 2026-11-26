import { fireEvent, render, screen } from '@testing-library/react-native';

import { AuthHeader } from '@/features/auth/components/AuthHeader';

describe('AuthHeader', () => {
  it('mostra título, subtítulo e o botão de voltar', async () => {
    const onPressBack = jest.fn();
    await render(<AuthHeader onPressBack={onPressBack} subtitle="Sub" title="Título" />);

    expect(screen.getByText('Título')).toBeOnTheScreen();
    expect(screen.getByText('Sub')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('back-button'));
    expect(onPressBack).toHaveBeenCalledTimes(1);
  });
});
