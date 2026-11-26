import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { ContactCard } from '@/components/supportScreen/ContactCard';

describe('ContactCard', () => {
  it('mostra inicial, nome e subtítulo padrão e liga para o contato', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render(<ContactCard fullName=" maria" phoneNumber="5551999998888" />);

    expect(screen.getByText('M')).toBeOnTheScreen();
    expect(screen.getByText(' maria')).toBeOnTheScreen();
    expect(screen.getByText('sua pessoa de conforto')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ligar' }));
    expect(openURL).toHaveBeenCalledWith('tel:5551999998888');
  });

  it('aceita subtítulo customizado', async () => {
    await render(<ContactCard fullName="João" phoneNumber="1" subtitle="irmão" />);

    expect(screen.getByText('irmão')).toBeOnTheScreen();
  });
});
