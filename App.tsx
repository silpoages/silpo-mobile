import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useAppFonts } from '@/hooks/useAppFonts';
import { colors, fontFamily, fontSize } from '@/theme';

import { ActionRow } from '../silpo-mobile/src/components/QuickActions/ActionRow';

export default function App() {
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Silpo Mobile</Text>
      <StatusBar style="dark" />
      <ActionRow/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
});
