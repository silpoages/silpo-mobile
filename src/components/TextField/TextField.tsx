import { useState } from 'react';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, layout, radii, spacing, typography } from '@/theme';
import { EyeIcon } from '@/components/icons';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  errorMessage?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  editable?: boolean;
  testID?: string;
};

/**
 * Campo de texto rotulado, como os nós 4236:962 e 4236:966 do Figma.
 *
 * Com `secureTextEntry`, exibe o botão de mostrar/ocultar senha. A mensagem de
 * erro fica ancorada no próprio campo, como pede o critério de aceite; o estado
 * de foco e o de erro não existem no design e usam, respectivamente, a cor da
 * marca e a de erro.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  errorMessage,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  editable = true,
  testID,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isContentHidden, setIsContentHidden] = useState(secureTextEntry);

  const hasError = Boolean(errorMessage);

  function handleToggleVisibility() {
    setIsContentHidden((hidden) => !hidden);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          editable={editable}
          keyboardType={keyboardType}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType={returnKeyType}
          secureTextEntry={isContentHidden}
          style={styles.input}
          testID={testID}
          textContentType={textContentType}
          value={value}
        />

        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isContentHidden ? 'Mostrar senha' : 'Ocultar senha'}
            accessibilityRole="button"
            hitSlop={spacing.lg}
            onPress={handleToggleVisibility}
            style={styles.visibilityToggle}
            testID={testID ? `${testID}-visibility-toggle` : undefined}
          >
            <EyeIcon crossed={isContentHidden} />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    width: '100%',
  },
  label: {
    ...typography.fieldLabel,
    color: colors.text,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.field,
    borderWidth: layout.borderWidth,
    flexDirection: 'row',
    height: layout.fieldHeight,
    paddingHorizontal: layout.fieldPaddingHorizontal,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  /**
   * `outlineWidth: 0` remove o contorno de foco que o navegador desenha em volta
   * do `<input>` na web. O foco já aparece na borda do `inputWrapper`.
   */
  input: {
    ...typography.input,
    color: colors.text,
    flex: 1,
    height: '100%',
    outlineWidth: 0,
  },
  visibilityToggle: {
    paddingLeft: spacing.md,
  },
  error: {
    ...typography.footnote,
    color: colors.danger,
  },
});
