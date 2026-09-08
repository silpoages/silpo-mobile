import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

type ChevronLeftIconProps = {
  size?: number;
  color?: string;
};

/**
 * Seta de voltar do cabeçalho.
 *
 * Traçado exportado do nó 4236:955 do Figma.
 */
export function ChevronLeftIcon({ size = 20, color = colors.text }: ChevronLeftIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" accessibilityRole="image">
      <Path
        d="M12.5 4.16667L6.66667 10L12.5 15.8333"
        stroke={color}
        strokeWidth={1.45833}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
