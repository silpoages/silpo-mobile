import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import { WelcomeScreen } from '@/features/auth/WelcomeScreen';

describe('WelcomeScreen', () => {
  beforeEach(async () => {
    await render(<WelcomeScreen />);
  });

  it('apresenta a marca', () => {
    expect(screen.getByText('Silpo')).toBeOnTheScreen();
    expect(screen.getByText('Aquele que te ajuda a dar o primeiro passo.')).toBeOnTheScreen();
  });

  it('leva ao apoio', async () => {
    await fireEvent.press(screen.getByRole('button', { name: 'Preciso de apoio agora' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/apoio');
  });

  it('leva ao cadastro', async () => {
    await fireEvent.press(screen.getByTestId('start-button'));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/cadastro');
  });

  it('leva ao login', async () => {
    await fireEvent.press(screen.getByTestId('sign-in-button'));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/login');
  });
});
