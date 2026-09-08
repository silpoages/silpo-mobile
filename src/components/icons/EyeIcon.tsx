import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

type EyeIconProps = {
  size?: number;
  color?: string;
  crossed?: boolean;
};

/**
 * Olho do botão de mostrar/ocultar senha; `crossed` marca o estado oculto.
 *
 * Não existe no Figma: os campos do design são estáticos e não desenham o
 * controle de visibilidade, que é critério de aceite da tarefa.
 */
export function EyeIcon({ size = 20, color = colors.textMuted, crossed = false }: EyeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityRole="image">
      <Path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={2.75} stroke={color} strokeWidth={1.4} />
      {crossed ? (
        <Path d="M4 20 20 4" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}
