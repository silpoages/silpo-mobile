import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Header } from '@/components/homeScreen/Header';
import { EmotionsRow } from '@/components/emotions/EmotionsRow';
import { DailyPractice } from '@/components/homeScreen/DailyPractice';
import { ActionRow } from '@/components/QuickActions/ActionRow';
import { useSession } from '@/features/auth/session/SessionContext';

const TODAY_PRACTICE = {
  title: 'Respiração 4-7-8',
  description: 'Uma pausa de 2 minutos para acalmar o corpo antes de seguir com o dia.',
};

/** Quick actions com uma tela própria já implementada — as demais ainda não têm destino. */
const ACTION_ROUTES: Record<string, '/respiracao'> = {
  respire: '/respiracao',
};

export function HomeScreen() {
  const router = useRouter();
  const session = useSession();

  function handleSelectAction(action: string) {
    const route = ACTION_ROUTES[action];

    if (route) {
      router.push(route);
    }
  }

  const userName = session.user?.fullName?.trim() || session.user?.email || '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          onPressAvatar={() => router.push('/perfil')}
          subtitle="Seus sentimentos importam"
          userName={userName}
        />
        <EmotionsRow />
        <DailyPractice
          title={TODAY_PRACTICE.title}
          description={TODAY_PRACTICE.description}
          onPressStart={() => router.push('/respiracao')}
        />
        <ActionRow onSelectAction={handleSelectAction} />
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
