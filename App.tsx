import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TabBar, TabKey } from './src/components/TabBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('jornada');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Silpo Mobile</Text>
      </View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
