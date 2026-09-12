import Svg, { G, Path } from 'react-native-svg';

import { colors, layout } from '@/theme';

type DecorativeCircleProps = {
  size?: number;
};

/**
 * Círculo decorativo do canto inferior direito da tela de boas-vindas.
 *
 * Traçado exportado do nó 4346:11268 do Figma, com a mesma opacidade de 50%.
 */
export function DecorativeCircle({ size = layout.decorativeCircleSize }: DecorativeCircleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
      <G opacity={0.5}>
        <Path
          d="M150 300C232.843 300 300 232.843 300 150C300 67.1573 232.843 0 150 0C67.1573 0 0 67.1573 0 150C0 232.843 67.1573 300 150 300Z"
          fill={colors.surfaceTint}
        />
        <Path
          d="M150 250C150 180 180 130 245 100C233 182 203 234 150 250Z"
          fill={colors.surfaceTintStrong}
        />
      </G>
    </Svg>
  );
}
