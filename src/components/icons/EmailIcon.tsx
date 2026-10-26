import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

type EmailIconProps = {
  size?: number;
  color?: string;
};

/**
 * Ícone de E-mail/Envelope.
 */
export function EmailIcon({ size = 30, color = colors.primary }: EmailIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M23.75 6.875H6.25C4.86929 6.875 3.75 7.99429 3.75 9.375V20.625C3.75 22.0057 4.86929 23.125 6.25 23.125H23.75C25.1307 23.125 26.25 22.0057 26.25 20.625V9.375C26.25 7.99429 25.1307 6.875 23.75 6.875Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.1875}
      />
      <Path
        d="M4.375 8.75L15 16.25L25.625 8.75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.1875}
      />
    </Svg>
  );
}
