import { Tabs } from 'expo-router';

import { PixelTabBar } from '@/components/ui/pixel-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PixelTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Pulse' }} />
      <Tabs.Screen name="governance" options={{ title: 'Decide' }} />
      <Tabs.Screen name="power" options={{ title: 'Power' }} />
    </Tabs>
  );
}
