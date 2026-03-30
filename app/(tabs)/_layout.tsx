import { Tabs, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { PixelTabBar } from '@/components/ui/pixel-tab-bar';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';

export default function TabLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      StorageService.setString(STORAGE_KEYS.ACTIVE_TAB, pathname);
    }
  }, [pathname]);

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
