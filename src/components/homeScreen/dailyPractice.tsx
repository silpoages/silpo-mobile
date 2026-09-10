import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/fonts';

export type dailyPracticeProps = {
  title: string;
  description: string;
};

export function DailyPractice({ title, description }: dailyPracticeProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>PRÁTICA DO DIA</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Quero tentar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Ver outras</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    minHeight: 196,
    borderColor: colors.border,
    borderWidth: 1,
    gap: 11,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    color: colors.text,
    letterSpacing: 0,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    letterSpacing: 0,
    lineHeight: 20,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: colors.primary,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  secondaryButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
