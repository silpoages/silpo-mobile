import type { TextStyle } from 'react-native';

import { fontFamily, fontSize } from '@/theme/fonts';

/**
 * Presets de texto das telas de autenticação.
 *
 * Cada preset combina uma família de `fontFamily` com um passo de `fontSize`:
 * no React Native o peso vem do arquivo da fonte, não de `fontWeight`.
 */

/**
 * Entrelinha "normal" da Nunito.
 *
 * O Figma deixa todos esses textos em `line-height: normal`; o fator abaixo
 * reproduz o valor que a fonte declara, para o texto não quebrar apertado.
 */
const NORMAL_LINE_HEIGHT_RATIO = 1.36;

function preset(family: string, size: number): TextStyle {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: Math.round(size * NORMAL_LINE_HEIGHT_RATIO),
  };
}

export const typography = {
  /** "Silpo", na tela de boas-vindas. */
  brand: preset(fontFamily.regular, fontSize.brandmark),
  /** Frase de apoio sob a marca. */
  tagline: preset(fontFamily.regular, fontSize.title),
  /** Título das telas de formulário. */
  title: preset(fontFamily.extraBold, fontSize.hero),
  /** Texto de apoio sob o título. */
  subtitle: preset(fontFamily.regular, fontSize.lg),
  /** Rótulo dos botões principais. */
  button: preset(fontFamily.bold, fontSize.xl),
  /** Rótulo acima de cada campo. */
  fieldLabel: preset(fontFamily.bold, fontSize.md),
  /** Texto digitado e placeholder dos campos. */
  input: preset(fontFamily.regular, fontSize.lg),
  /** Pergunta da linha "Já tem conta?". */
  linkQuestion: preset(fontFamily.regular, fontSize.body),
  /** Link que troca de tela. */
  link: preset(fontFamily.extraBold, fontSize.body),
  /** Selo "Preciso de apoio agora". */
  pill: preset(fontFamily.bold, fontSize.md),
  /** Rótulo "ou" do separador. */
  divider: preset(fontFamily.regular, fontSize.md),
  /** Rótulo do botão de conta Google. */
  socialButton: preset(fontFamily.bold, fontSize.lg),
  /** Aviso de privacidade no rodapé e mensagens de erro. */
  footnote: preset(fontFamily.regular, fontSize.sm),
} as const satisfies Record<string, TextStyle>;
