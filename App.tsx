import { StyleSheet, Text, View } from 'react-native';
import UserProfileScreen from './src/screens/UserProfileScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <UserProfileScreen></UserProfileScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },
});
