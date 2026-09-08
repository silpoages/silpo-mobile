import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppFonts } from '@/hooks/useAppFonts';
import { AuthNavigator } from '@/navigation';
import { colors } from '@/theme';

export default function App() {
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
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
    backgroundColor: colors.background,
    flex: 1,
  },
});
