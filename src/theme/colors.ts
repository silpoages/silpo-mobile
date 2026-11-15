/** Paleta semântica baseada na página 'Jade Horizon - Mobile' do Figma. */
export const colors = {
  background: '#F3FAF4',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF6EC',
  surfaceTint: '#DDF2E0',
  /** Tom mais fechado do `surfaceTint`, usado no círculo interno da tela de boas-vindas. */
  surfaceTintStrong: '#B7E5BA',

  text: '#123A2E',
  textSecondary: '#46695B',
  textMuted: '#93ACA1',
  textInverse: '#FFFFFF',

  primary: '#288760',
  primaryDark: '#1A5140',

  border: '#D2EBD5',
  borderSubtle: '#EAF6EC',

  support: {
    primary: '#6631DB',
    dark: '#3A1A85',
    muted: '#7B45F0',
    text: '#3A1A85',
    surface: '#F3EEFF',
    border: '#D0BCFC',
  },

  /** Preenchimento das barras de distribuição de emoções, na Jornada. */
  chartFill: '#5CA87C',

  achievement: {
    surface: '#F6EEDD',
    icon: '#8A6423',
  },

  danger: '#9E4A41',
} as const;

export type Colors = typeof colors;
