/**
 * Medidas exatas dos frames de autenticação do Figma, desenhados sobre
 * 390 × 844. Ficam separadas de `spacing` porque são medidas de composição da
 * tela, não passos de uma escala.
 */
export const layout = {
  /** Margem lateral do conteúdo (`Content` do Cadastro começa em x = 24). */
  screenPadding: 24,
  /** Largura do conteúdo: 390 − 2 × 24. */
  contentMaxWidth: 342,
  buttonHeight: 54,
  fieldHeight: 52,
  fieldPaddingHorizontal: 16,
  backButtonSize: 44,
  logoSize: 233,
  supportPillHeight: 40,
  supportPillGap: 7,
  decorativeCircleSize: 300,
  /** Espessura das bordas de campos e do botão secundário. */
  borderWidth: 1.5,
  /** Distância entre o título e o texto de apoio. */
  titleGap: 14,
  /** Distância entre o texto de apoio e o formulário. */
  formGap: 28,
  /** Distância entre a marca e a frase, na tela de boas-vindas. */
  heroGap: 18,
} as const;
