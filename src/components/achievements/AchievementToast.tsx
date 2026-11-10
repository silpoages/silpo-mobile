import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toAchievementIcon } from '@/components/achievements/achievementIcon';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

/** Quanto tempo o aviso fica na tela antes de sumir sozinho. */
const VISIBLE_MS = 4000;
const ANIMATION_MS = 250;
/** Distância de onde o aviso desliza: fora da tela, acima do topo. */
const HIDDEN_OFFSET = -120;

type AchievementToastProps = {
  name: string;
  icon: string;
  /** Chamado quando o aviso termina de sair, por tempo ou toque. */
  onDismiss: () => void;
};

/**
 * Aviso curto de conquista no topo da tela, como uma notificação do celular.
 * Não bloqueia o app: some sozinho e pode ser fechado com um toque.
 */
export function AchievementToast({ name, icon, onDismiss }: AchievementToastProps) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(HIDDEN_OFFSET));
  const isDismissingRef = useRef(false);

  const dismiss = useCallback(() => {
    if (isDismissingRef.current) {
      return;
    }
    isDismissingRef.current = true;
    Animated.timing(translateY, {
      toValue: HIDDEN_OFFSET,
      duration: ANIMATION_MS,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }, [onDismiss, translateY]);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Nova conquista: ${name}`);
    Animated.timing(translateY, {
      toValue: 0,
      duration: ANIMATION_MS,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(dismiss, VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [dismiss, name, translateY]);

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: insets.top + spacing.md }]}>
      <Animated.View style={[styles.toastWrapper, { transform: [{ translateY }] }]}>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={`Nova conquista: ${name}`}
          accessibilityHint="Toque para fechar"
          style={({ pressed }) => [styles.toast, pressed && styles.pressed]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={toAchievementIcon(icon)} size={18} color={colors.achievement.icon} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.label}>Nova conquista</Text>
            <Text style={styles.title} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1000,
    elevation: 1000,
  },
  toastWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '0px 4px 12px rgba(31, 51, 41, 0.15)',
  },
  pressed: {
    opacity: 0.85,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.achievement.surface,
  },
  texts: {
    flex: 1,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
