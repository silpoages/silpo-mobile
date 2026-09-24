import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { TabBar, type TabKey } from '@/components/TabBar';

// TabBar (feat/tab-bar) foi escrito para um `activeTab`/`onTabPress` controlados na mão —
// esse adaptador traduz isso para o `state`/`navigation` que o Expo Router passa pro `tabBar`.
const ROUTE_NAME_BY_TAB: Record<TabKey, string> = {
  home: 'index',
  diario: 'diario',
  jornada: 'jornada',
  apoio: 'apoio',
};

const TAB_BY_ROUTE_NAME: Record<string, TabKey> = {
  index: 'home',
  diario: 'diario',
  jornada: 'jornada',
  apoio: 'apoio',
};

function renderTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name ?? 'index';
  const activeTab = TAB_BY_ROUTE_NAME[activeRouteName] ?? 'home';

  function handleTabPress(tab: TabKey) {
    navigation.navigate(ROUTE_NAME_BY_TAB[tab]);
  }

  return <TabBar activeTab={activeTab} onTabPress={handleTabPress} />;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diario" />
      <Tabs.Screen name="jornada" />
      <Tabs.Screen name="apoio" />

      <Tabs.Screen name="perfil" options={{ href: null }} />
    </Tabs>
  );
}
