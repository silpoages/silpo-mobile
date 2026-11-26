/**
 * Os testes das rotas ficam fora de `app/`: o Expo Router trata todo `.tsx` dali como rota.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';
import { setMockPathname } from '@test/mocks/expoRouter';
import type { ReactNode } from 'react';

import RootLayout from '../../app/_layout';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useDailyReminderSync } from '@/features/notifications/useDailyReminderSync';

jest.mock('@/hooks/useAppFonts', () => ({ useAppFonts: jest.fn() }));
jest.mock('@/features/notifications/useDailyReminderSync', () => ({
  useDailyReminderSync: jest.fn(),
}));
jest.mock('@/features/notifications/dailyReminder', () => ({
  cancelDailyReminder: jest.fn(),
}));
jest.mock('@/features/achievements/AchievementAlertContext', () => ({
  AchievementAlertProvider: ({ children }: { children: ReactNode }) => children,
}));

const mockedUseAppFonts = jest.mocked(useAppFonts);

describe('RootLayout', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setMockPathname('/diario');
  });

  it('não renderiza nada enquanto as fontes carregam', async () => {
    mockedUseAppFonts.mockReturnValue({ isLoaded: false, error: null });

    await render(<RootLayout />);

    expect(screen.queryByTestId('stack')).toBeNull();
    expect(useDailyReminderSync).not.toHaveBeenCalled();
  });

  it('monta a navegação e o guard depois de carregar fontes e sessão', async () => {
    mockedUseAppFonts.mockReturnValue({ isLoaded: true, error: null });

    await render(<RootLayout />);

    expect(await screen.findByTestId('stack')).toBeOnTheScreen();
    expect(useDailyReminderSync).toHaveBeenCalled();
    // sem sessão persistida, o guard manda para a Welcome
    expect(screen.getByTestId('redirect')).toHaveTextContent('/welcome');
  });

  it('segue mesmo se as fontes falharem', async () => {
    mockedUseAppFonts.mockReturnValue({ isLoaded: false, error: new Error('fonte') });

    await render(<RootLayout />);

    expect(await screen.findByTestId('stack')).toBeOnTheScreen();
  });
});
