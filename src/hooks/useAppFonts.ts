import { useFonts } from 'expo-font';
import { nunitoFonts } from '@/theme/fonts';

export function useAppFonts() {
  const [isLoaded, error] = useFonts(nunitoFonts);

  return { isLoaded, error };
}
