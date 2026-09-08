import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import { colors, fontFamily, fontSize } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'support' | 'supportText';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'rounded' | 'pill';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string;
  leftIcon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.textInverse,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.primary,
  },
  support: {
    backgroundColor: colors.support.primary,
    borderColor: colors.support.primary,
    color: colors.textInverse,
  },
  supportText: {
    backgroundColor: colors.support.surface,
    borderColor: colors.support.surface,
    color: colors.support.text,
  },
} as const;

const sizeStyles = {
  sm: { minHeight: 36, paddingHorizontal: 16, fontSize: fontSize.md },
  md: { minHeight: 44, paddingHorizontal: 20, fontSize: fontSize.body },
  lg: { minHeight: 52, paddingHorizontal: 24, fontSize: fontSize.lg },
} as const;

export function Button({
  children,
  leftIcon,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const palette = variantStyles[variant];
  const dimensions = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          borderRadius: shape === 'pill' ? 999 : 12,
          minHeight: dimensions.minHeight,
          paddingHorizontal: dimensions.paddingHorizontal,
          opacity: pressed || isDisabled ? 0.78 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.color} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              { color: palette.color, fontSize: dimensions.fontSize },
              textStyle,
              leftIcon ? styles.textWithIcon : undefined,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
