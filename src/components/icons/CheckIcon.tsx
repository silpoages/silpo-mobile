import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

type CheckIconProps = {
  width?: number;
  height?: number;
  color?: string;
};
/**
 * Ícone de 'check'.
 */
export function CheckIcon({ width = 22, height = 17, color = colors.textInverse }: CheckIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 17" fill="none">
      <Path
        d="M1.5625 9.0625L7.8125 15.3125L20.3125 1.5625"
        stroke={color}
        strokeWidth={3.125}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
