import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

type InfoIconProps = {
  size?: number;
  color?: string;
};

/**
 * "i" dentro de um círculo, usado nos avisos informativos.
 */
export function InfoIcon({ size = 16, color = colors.textSecondary }: InfoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" accessibilityRole="image">
      <Circle cx={8} cy={8} r={6.6} stroke={color} strokeWidth={1.2} />
      <Path d="M8 7.2V11" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={8} cy={4.9} r={0.8} fill={color} />
    </Svg>
  );
}
