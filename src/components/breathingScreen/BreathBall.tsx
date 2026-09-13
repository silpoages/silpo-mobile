import { Animated, type Animated as AnimatedNamespace } from 'react-native';

import { colors } from '@/theme';

type BreathBallProps = {
  size: number;
  color?: string;
  scale?: number | AnimatedNamespace.Value;
};

export function BreathBall({ size, color, scale = 1 }: BreathBallProps) {
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? colors.primary,
        transform: [{ scale }],
      }}
    />
  );
}
