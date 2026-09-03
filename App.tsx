import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { EmotionsRow } from './src/components/emotions/emotionsRow';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Silpo Mobile</Text>
      <EmotionsRow/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
