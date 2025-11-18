import { PepperDashboard } from '@/components/home/pepper-dashboard';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView className="flex-1 p-4" style={{ backgroundColor: FOREST_GREEN }}>
      <PepperDashboard />
    </ThemedView>
  );
}
