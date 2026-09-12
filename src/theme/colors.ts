export const colors = {
  background: '#F6F8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EFF4EE',
  surfaceTint: '#E3F0E7',

  text: '#1F3329',
  textSecondary: '#55685D',
  textMuted: '#9AAAA0',
  textInverse: '#FFFFFF',

  primary: '#3F6B57',
  primaryDark: '#2F5544',

  border: '#DEE8DF',
  borderSubtle: '#EAF1EA',

  support: {
    primary: '#6C5F94',
    dark: '#4F4478',
    muted: '#5D5482',
    text: '#332B4D',
    surface: '#EEEBF5',
    border: '#DDD6EC',
  },

  danger: '#9E4A41',
} as const;

export type Colors = typeof colors;
