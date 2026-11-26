import { fireEvent, render, screen } from '@testing-library/react-native';

import { HelpCard } from '@/components/emailConfirmationScreen/HelpCard';

describe('HelpCard', () => {
  it('mostra a dica e permite alterar o e-mail', async () => {
    const onPressChangeEmail = jest.fn();
    await render(<HelpCard onPressChangeEmail={onPressChangeEmail} />);

    expect(screen.getByText(/Confira as pastas de spam/)).toBeOnTheScreen();
    expect(screen.getByText('E-mail errado?')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar e-mail' }));
    expect(onPressChangeEmail).toHaveBeenCalledTimes(1);
  });
});
