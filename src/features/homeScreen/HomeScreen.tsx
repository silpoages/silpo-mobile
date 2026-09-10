import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme/colors';
import { FontFamily, fontSize } from '@/theme/fonts';
import { Header } from '@/components/homeScreen/Header';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header: saudação + botão de apoio */}
        <Header userName="Sol" subtitle="Seu sentimentos importam" />

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
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 64,
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 116,
  },
  block: {
    width: '100%',
  },
  tempPreview: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
