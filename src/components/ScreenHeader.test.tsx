import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';

describe('ScreenHeader', () => {
  it('mostra logo, título e a ação à direita', async () => {
    await render(<ScreenHeader title="Diário" right={<Text>ação</Text>} />);

    expect(screen.getByRole('header')).toHaveTextContent('Diário');
    expect(screen.getByLabelText('Silpo')).toBeOnTheScreen();
    expect(screen.getByText('ação')).toBeOnTheScreen();
  });
});
