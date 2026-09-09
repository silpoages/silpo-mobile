import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TabBar, TabKey } from './src/components/TabBar';
import { useAppFonts } from '@/hooks/useAppFonts';
import { colors, fontFamily, fontSize } from '@/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('jornada');
  const { isLoaded, error } = useAppFonts();

  if (!isLoaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Silpo Mobile</Text>
      </View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
});
