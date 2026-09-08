import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme';

type HeartIconProps = {
  size?: number;
  color?: string;
};

/**
 * Coração do selo "Preciso de apoio agora".
 *
 * Traçado exportado do nó 4346:11273 do Figma.
 */
export function HeartIcon({ size = 15, color = colors.text.support }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" accessibilityRole="image">
      <Path
        d="M7.5 12.5C7.5 12.5 3.125 9.6875 3.125 6.25C3.14287 5.74992 3.3104 5.26671 3.60591 4.8629C3.90142 4.45908 4.31132 4.15323 4.78256 3.98493C5.25381 3.81663 5.76472 3.79362 6.24918 3.91887C6.73365 4.04413 7.16938 4.31188 7.5 4.6875C7.83062 4.31188 8.26635 4.04413 8.75082 3.91887C9.23528 3.79362 9.74619 3.81663 10.2174 3.98493C10.6887 4.15323 11.0986 4.45908 11.3941 4.8629C11.6896 5.26671 11.8571 5.74992 11.875 6.25C11.875 9.6875 7.5 12.5 7.5 12.5Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
