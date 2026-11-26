import { fireEvent, render, screen } from '@testing-library/react-native';

import { SupportPill } from '@/features/auth/components/SupportPill';

describe('SupportPill', () => {
  it('leva ao apoio ao tocar', async () => {
    const onPress = jest.fn();
    await render(<SupportPill onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Preciso de apoio agora' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
