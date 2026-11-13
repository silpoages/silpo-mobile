import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type PlaybackErrorCardProps = {
  onRetry: () => void;
  onEnd: () => void;
};

export function PlaybackErrorCard({ onRetry, onEnd }: PlaybackErrorCardProps) {
  return (
    <View style={styles.card} accessibilityRole="alert">
      <Text style={styles.title}>Não foi possível reproduzir o áudio.</Text>
      <Text style={styles.description}>
        Verifique sua conexão e tente de novo. Seu progresso foi mantido.
      </Text>
      <View style={styles.actions}>
        <Button variant="support" onPress={onRetry}>
          Tentar novamente
        </Button>
        <Button variant="ghost" onPress={onEnd} textStyle={styles.endText}>
          Encerrar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.support.border,
    backgroundColor: colors.support.surface,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xl,
    color: colors.support.dark,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    color: colors.support.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  endText: {
    color: colors.support.primary,
  },
});
