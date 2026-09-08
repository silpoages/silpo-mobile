import type { TextStyle } from 'react-native';

/**
 * Tipografia das telas de autenticação.
 *
 * O arquivo de design usa Nunito em três pesos. Como no React Native o peso vem
 * do arquivo da fonte, e não de `fontWeight`, cada preset aponta para a família
 * carregada em `fonts.ts`.
 */
export const fontFamily = {
  regular: 'Nunito_400Regular',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

/**
 * Entrelinha "normal" da Nunito.
 *
 * O Figma deixa todos esses textos em `line-height: normal`; o fator abaixo
 * reproduz o valor que a fonte declara, para o texto não quebrar apertado.
 */
const NORMAL_LINE_HEIGHT_RATIO = 1.36;

function preset(family: string, fontSize: number): TextStyle {
  return {
    fontFamily: family,
    fontSize,
    lineHeight: Math.round(fontSize * NORMAL_LINE_HEIGHT_RATIO),
  };
}

export const typography = {
  /** "Silpo", na tela de boas-vindas. */
  brand: preset(fontFamily.regular, 38),
  /** Frase de apoio sob a marca. */
  tagline: preset(fontFamily.regular, 18),
  /** Título das telas de formulário. */
  title: preset(fontFamily.extraBold, 26),
  /** Texto de apoio sob o título. */
  subtitle: preset(fontFamily.regular, 15),
  /** Rótulo dos botões principais. */
  button: preset(fontFamily.bold, 16),
  /** Rótulo acima de cada campo. */
  fieldLabel: preset(fontFamily.bold, 13),
  /** Texto digitado e placeholder dos campos. */
  input: preset(fontFamily.regular, 15),
  /** Pergunta da linha "Já tem conta?". */
  linkQuestion: preset(fontFamily.regular, 14),
  /** Link que troca de tela. */
  link: preset(fontFamily.extraBold, 14),
  /** Selo "Preciso de apoio agora". */
  pill: preset(fontFamily.bold, 13),
  /** Rótulo "ou" do separador. */
  divider: preset(fontFamily.regular, 13),
  /** Rótulo do botão de conta Google. */
  socialButton: preset(fontFamily.bold, 15),
  /** Aviso de privacidade no rodapé e mensagens de erro. */
  footnote: preset(fontFamily.regular, 12),
} as const satisfies Record<string, TextStyle>;
