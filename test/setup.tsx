import { resetExpoRouterMock } from './mocks/expoRouter';

jest.mock('expo-router', () => require('./mocks/expoRouter'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

require('react-native-gesture-handler/jestSetup');

beforeEach(() => {
  resetExpoRouterMock();
});
