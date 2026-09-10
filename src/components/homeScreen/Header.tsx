import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, FontFamily, fontSize } from '@/theme/fonts';

type HeaderProps = {
  userName: string;
  subtitle: string;
};

export function Header({ userName, subtitle }: HeaderProps) {
  const inicialNome = userName.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting} numberOfLines={3}>
          Boa noite, {userName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={4}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.inicial}>{inicialNome}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.heading,
    color: colors.surface,
  },
});
