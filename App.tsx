import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthNavigator } from './src/navigation';
import { colors, fontAssets } from './src/theme';

export default function App() {
  const [areFontsLoaded] = useFonts(fontAssets);

  if (!areFontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AuthNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  /** Evita o piscar branco entre o splash e a primeira tela. */
  splash: {
    backgroundColor: colors.background.canvas,
    flex: 1,
  },
});
