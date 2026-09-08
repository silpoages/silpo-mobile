import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SignInScreen, SignUpScreen, WelcomeScreen } from '@/features/auth/screens';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Pilha de autenticação.
 *
 * Sem cabeçalho nativo: cada tela desenha o próprio topo, como no design.
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen component={WelcomeScreen} name="Welcome" />
      <Stack.Screen component={SignUpScreen} name="SignUp" />
      <Stack.Screen component={SignInScreen} name="SignIn" />
    </Stack.Navigator>
  );
}
