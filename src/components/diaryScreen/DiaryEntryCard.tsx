import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { DiaryEntry } from '@/features/diaryScreen/diaryTypes';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  onDelete?: (entry: DiaryEntry) => void;
};

export function DiaryEntryCard({ entry, onDelete }: DiaryEntryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const emotion = EMOTIONS.find((item) => item.id === entry.mood);

  const hasActions = entry.note !== null && onDelete !== undefined;

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete?.(entry);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.emotionIcon}>
          {emotion ? (
            <MaterialCommunityIcons name={emotion.iconName} size={26} color={colors.primary} />
          ) : null}
        </View>

        <View style={styles.headerText}>
          <Text style={styles.emotionLabel}>{emotion?.label}</Text>
          <Text style={styles.subtitle}>Obrigado por registrar como você está se sentindo.</Text>
        </View>

        {hasActions ? (
          <Pressable
            accessibilityLabel="Mais ações do registro"
            accessibilityRole="button"
            accessibilityState={{ expanded: isMenuOpen }}
            hitSlop={spacing.md}
            onPress={() => setIsMenuOpen((isOpen) => !isOpen)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {isMenuOpen ? (
        <View style={styles.menu}>
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            <Text style={styles.menuItemDangerText}>Excluir registro</Text>
          </Pressable>
        </View>
      ) : null}

      {entry.note !== null ? <Text style={styles.note}>&quot;{entry.note}&quot;</Text> : null}

      {entry.practiceTitle !== null ? (
        <View style={styles.practice}>
          <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
          <Text style={styles.practiceText}>Prática: {entry.practiceTitle}</Text>
        </View>
      ) : null}

      {entry.photoUri !== null ? (
        <Image
          accessibilityLabel="Foto do registro"
          source={{ uri: entry.photoUri }}
          style={styles.photo}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emotionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  emotionLabel: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.5,
  },
  menu: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  menuItemDangerText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.danger,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: 22,
    color: colors.text,
  },
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  practiceText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
});
