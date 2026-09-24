import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppFonts } from '@/hooks/useAppFonts';
import { RouteGuard } from '@/features/auth/session/RouteGuard';
import { SessionProvider, useSession } from '@/features/auth/session/SessionContext';
import { colors } from '@/theme';

export default function RootLayout() {
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SessionProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

/** Espera a sessão persistida carregar, senão a Welcome pisca para quem está logado. */
function RootNavigator() {
  const session = useSession();

  if (session.isLoading) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <RouteGuard />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
