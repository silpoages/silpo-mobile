import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';

/**
 * Fontes carregadas na inicialização do app.
 *
 * A importação é feita peso a peso, e não pelo índice do pacote, para o bundle
 * levar só os três arquivos usados em vez dos dezesseis da família.
 *
 * As chaves precisam bater com os nomes usados em `typography.fontFamily`.
 */
export const fontAssets = {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} as const;
