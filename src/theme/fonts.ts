import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';

/**
 * Fontes carregadas na inicialização do app, via `useAppFonts`.
 *
 * A importação é feita peso a peso, e não pelo índice do pacote, para o bundle
 * levar só os quatro arquivos usados em vez dos dezesseis da família.
 */
export const nunitoFonts = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
};

export const fontFamily = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  body: 14,
  lg: 15,
  xl: 16,
  title: 18,
  heading: 22,
  display: 24,
  /** Título das telas de autenticação (frames `Welcome` e `Cadastro` do Figma). */
  hero: 26,
  /** Marca "Silpo" na tela de boas-vindas. */
  brandmark: 38,
} as const;

export type FontFamily = (typeof fontFamily)[keyof typeof fontFamily];
