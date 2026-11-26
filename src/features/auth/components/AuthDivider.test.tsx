import { render, screen } from '@testing-library/react-native';

import { AuthDivider } from '@/features/auth/components/AuthDivider';

describe('AuthDivider', () => {
  it('mostra o separador "ou"', async () => {
    await render(<AuthDivider />);

    expect(screen.getByText('ou')).toBeOnTheScreen();
  });
});
