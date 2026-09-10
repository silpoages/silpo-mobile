import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header: saudação + botão de apoio */}
        <View style={[styles.block, styles.tempPreview]} />

        {/* Card: seletor de humor */}
        <View style={[styles.block, styles.tempPreview]} />

        {/* Card: prática do dia */}
        <View style={[styles.block, styles.tempPreview]} />

        {/* Seção: exercícios rápidos */}
        <View style={[styles.block, styles.tempPreview]} />

        {/* Card: continue sua jornada */}
        <View style={[styles.block, styles.tempPreview]} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },
  scrollContent: {
    paddingTop: 64,
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 116,
  },
  //genérico para os próximos componentes
  block: {
    width: '100%',
  },
  //TEMPORÁRIO — só fiz para ter uma base
  tempPreview: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE8DF',
  },
});
