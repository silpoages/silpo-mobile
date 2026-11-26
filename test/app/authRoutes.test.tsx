import { render, screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import RegisterRoute from '../../app/cadastro';
import EmailConfirmationRoute from '../../app/confirmar-email';
import ForgotPasswordRoute from '../../app/esqueci-senha';
import LoginRoute from '../../app/login';
import WelcomeRoute from '../../app/welcome';

function mockScreen(name: string) {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return <Text testID="feature-screen">{name}</Text>;
}

jest.mock('@/features/auth/SignInScreen', () => ({
  SignInScreen: () => mockScreen('SignInScreen'),
}));
jest.mock('@/features/auth/RegisterScreen', () => ({
  RegisterScreen: () => mockScreen('RegisterScreen'),
}));
jest.mock('@/features/auth/ForgotPasswordScreen', () => ({
  ForgotPasswordScreen: () => mockScreen('ForgotPasswordScreen'),
}));
jest.mock('@/features/auth/WelcomeScreen', () => ({
  WelcomeScreen: () => mockScreen('WelcomeScreen'),
}));
jest.mock('@/features/emailConfirmationScreen/EmailConfirmationScreen', () => ({
  EmailConfirmationScreen: () => mockScreen('EmailConfirmationScreen'),
}));

describe('rotas de autenticação', () => {
  it.each<[string, ComponentType, string]>([
    ['/login', LoginRoute, 'SignInScreen'],
    ['/cadastro', RegisterRoute, 'RegisterScreen'],
    ['/esqueci-senha', ForgotPasswordRoute, 'ForgotPasswordScreen'],
    ['/confirmar-email', EmailConfirmationRoute, 'EmailConfirmationScreen'],
    ['/welcome', WelcomeRoute, 'WelcomeScreen'],
  ])('%s só renderiza a tela da feature', async (_path, Route, screenName) => {
    await render(<Route />);

    expect(screen.getByTestId('feature-screen')).toHaveTextContent(screenName);
  });
});
