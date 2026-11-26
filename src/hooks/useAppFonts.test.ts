import { renderHook } from '@testing-library/react-native';
import { useFonts } from 'expo-font';

import { useAppFonts } from '@/hooks/useAppFonts';
import { nunitoFonts } from '@/theme/fonts';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));

const mockedUseFonts = jest.mocked(useFonts);

describe('useAppFonts', () => {
  it('carrega as fontes Nunito e expõe o estado', async () => {
    mockedUseFonts.mockReturnValue([true, null]);

    const { result } = await renderHook(() => useAppFonts());

    expect(mockedUseFonts).toHaveBeenCalledWith(nunitoFonts);
    expect(result.current).toEqual({ isLoaded: true, error: null });
  });

  it('repassa o erro de carregamento', async () => {
    const error = new Error('falhou');
    mockedUseFonts.mockReturnValue([false, error]);

    const { result } = await renderHook(() => useAppFonts());

    expect(result.current).toEqual({ isLoaded: false, error });
  });
});
