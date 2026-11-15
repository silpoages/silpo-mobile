import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontFamily, fontSize, spacing } from '@/theme';
import { useBubblePopSound } from './useBubblePopSound';

type BubbleMode = 'free' | 'rhythm';

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  scale: Animated.Value;
};

const FREE_COUNT = 8;
const RHYTHM_INTERVAL_MS = 900;
const BUBBLE_COLORS = [
  colors.primary,
  colors.chartFill,
  colors.surfaceTintStrong,
  colors.primaryDark,
];

function createBubble(id: number, width: number, height: number): Bubble {
  const size = 56 + Math.round(Math.random() * 36);
  return {
    id,
    x: Math.random() * Math.max(width - size, 1),
    y: Math.random() * Math.max(height - size, 1),
    size,
    color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
    scale: new Animated.Value(1),
  };
}

export function BubblesScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const playfieldHeight = Math.max(height - 180, 240);
  const playfieldWidth = Math.max(width - spacing.xl * 2, 240);
  const nextId = useRef(1);
  const [mode, setMode] = useState<BubbleMode>('free');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const playPopSound = useBubblePopSound();

  useEffect(() => {
    nextId.current = 1;
    if (mode === 'free') {
      setBubbles(
        Array.from({ length: FREE_COUNT }, () =>
          createBubble(nextId.current++, playfieldWidth, playfieldHeight),
        ),
      );
      return;
    }

    setBubbles([createBubble(nextId.current++, playfieldWidth, playfieldHeight)]);
    const timer = setInterval(() => {
      setBubbles((current) => [
        ...current,
        createBubble(nextId.current++, playfieldWidth, playfieldHeight),
      ]);
    }, RHYTHM_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [mode, playfieldWidth, playfieldHeight]);

  function popBubble(id: number) {
    const bubble = bubbles.find((item) => item.id === id);
    if (!bubble) return;

    playPopSound();
    Animated.timing(bubble.scale, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setBubbles((current) => {
        const remaining = current.filter((item) => item.id !== id);
        if (mode === 'free') {
          return [...remaining, createBubble(nextId.current++, playfieldWidth, playfieldHeight)];
        }
        return remaining;
      });
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={spacing.md}>
          <Text style={styles.exit}>Sair</Text>
        </Pressable>
        <Text style={styles.title}>Estoure as bolinhas</Text>
      </View>

      <View style={styles.modes}>
        <ModeButton label="Livre" selected={mode === 'free'} onPress={() => setMode('free')} />
        <ModeButton label="Ritmo" selected={mode === 'rhythm'} onPress={() => setMode('rhythm')} />
      </View>

      <View style={styles.field}>
        {bubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                backgroundColor: bubble.color,
                transform: [{ scale: bubble.scale }],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Estourar bolinha"
              onPress={() => popBubble(bubble.id)}
              style={styles.fill}
            />
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.modeButton, selected && styles.modeButtonSelected]}
    >
      <Text style={[styles.modeLabel, selected && styles.modeLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  exit: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.text,
  },
  modes: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeButton: {
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  modeLabelSelected: {
    color: colors.textInverse,
  },
  field: {
    flex: 1,
    marginTop: spacing.lg,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
  },
  fill: {
    flex: 1,
  },
});
