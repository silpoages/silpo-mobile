import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme/colors';
import { Header } from '@/components/homeScreen/Header';
import { EmotionsRow } from '@/components/emotions/EmotionsRow';
import { DailyPractice } from '@/components/homeScreen/DailyPractice';

const TODAY_PRACTICE = {
  title: 'Respiração 4-7-8',
  description: 'Uma pausa de 2 minutos para acalmar o corpo antes de seguir com o dia.',
};

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header userName="Sol" subtitle="Seus sentimentos importam" />
        <EmotionsRow />
        <DailyPractice title={TODAY_PRACTICE.title} description={TODAY_PRACTICE.description} />
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
    paddingTop: 22,
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
