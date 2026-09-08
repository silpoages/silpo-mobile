export const nunitoFonts = {} as const;

export const fontFamily = {
  regular: 'sans-serif',
  semiBold: 'sans-serif',
  bold: 'sans-serif',
  extraBold: 'sans-serif',
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
} as const;

export type FontFamily = (typeof fontFamily)[keyof typeof fontFamily];
