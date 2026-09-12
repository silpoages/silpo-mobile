import { Animated, type Animated as AnimatedNamespace } from 'react-native';

type BreathBallProps = {
  size: number;
  color?: string;
  scale?: number | AnimatedNamespace.Value;
};

export default function BreathBall({ size, color, scale = 1 }: BreathBallProps) {
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? '#3F6B57',
        transform: [{ scale }],
      }}
    />
  );
}
