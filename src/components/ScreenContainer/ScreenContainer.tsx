import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout } from '../../theme';

/**
 * Largura máxima da moldura: a do frame do Figma (390 = 342 de conteúdo mais as
 * duas margens de 24). Impede que o formulário estique em tablets.
 */
const MAX_FRAME_WIDTH = layout.contentMaxWidth + layout.screenPadding * 2;

type ScreenContainerProps = {
  children: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Moldura das telas: área segura, desvio do teclado e rolagem quando a tela é
 * baixa demais para o conteúdo. Garante o mesmo comportamento em telas
 * pequenas, grandes e com o teclado aberto.
 */
export function ScreenContainer({
  children,
  background = colors.background.canvas,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /**
   * `overflow: hidden` recorta os elementos decorativos que sangram pelas
   * bordas, como o frame do Figma faz. Sem isso, na web eles alargam a área de
   * rolagem e empurram o conteúdo para o lado.
   */
  safeArea: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
  content: {
    flex: 1,
    maxWidth: MAX_FRAME_WIDTH,
    paddingHorizontal: layout.screenPadding,
    width: '100%',
  },
});
