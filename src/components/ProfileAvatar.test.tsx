import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfileAvatar } from '@/components/ProfileAvatar';

describe('ProfileAvatar', () => {
  it('mostra a inicial maiúscula ignorando espaços e abre o perfil', async () => {
    const onPress = jest.fn();
    await render(<ProfileAvatar onPress={onPress} userName="  ana" />);

    expect(screen.getByText('A')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza sem handler', async () => {
    await render(<ProfileAvatar userName="bruno" />);
    expect(screen.getByText('B')).toBeTruthy();
  });
});
