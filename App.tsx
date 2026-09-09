import { StyleSheet, Text, View } from 'react-native';
import { useAppFonts } from '@/hooks/useAppFonts';
import { colors, fontFamily, fontSize } from '@/theme';
import { StatusBar } from 'expo-status-bar';
import UserProfileScreen from '@/features/profileScreen/UserProfileScreen';

export default function App() {
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Silpo Mobile</Text>
      <UserProfileScreen></UserProfileScreen>
      <StatusBar style="dark" />
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
