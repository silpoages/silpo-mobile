import { fireEvent, render, screen } from '@testing-library/react-native';

import { BackButton } from '@/components/BackButton';

describe('BackButton', () => {
  it('renderiza com rótulo acessível e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<BackButton onPress={onPress} testID="back" />);

    const button = screen.getByRole('button', { name: 'Voltar' });
    expect(button).toBe(screen.getByTestId('back'));

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
