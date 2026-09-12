import { StyleSheet, View } from 'react-native';
import ExampleCard from '@/components/ExampleCard';
import { useExampleItem } from '@/hooks/useExampleItem';
import { colors } from '@/theme';

export default function ExampleScreen() {
  const item = useExampleItem();

  return (
    <View style={styles.container}>
      <ExampleCard title={item.title} description={item.description} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },
});
