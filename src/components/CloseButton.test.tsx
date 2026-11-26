import { fireEvent, render, screen } from '@testing-library/react-native';

import { CloseButton } from '@/components/CloseButton';

describe('CloseButton', () => {
  it('é um botão "Fechar" que repassa onPress', async () => {
    const onPress = jest.fn();
    await render(<CloseButton onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
