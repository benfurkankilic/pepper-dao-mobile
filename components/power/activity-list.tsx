import { FlatList, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import type { ActivityDisplay } from '@/types/user';

interface ActivityListProps {
  activities: Array<ActivityDisplay>;
  isLoading?: boolean;
}

/**
 * Activity List Component
 *
 * Displays activity feed with reputation changes
 */
export function ActivityList({ activities, isLoading }: ActivityListProps) {
  if (isLoading) {
    return (
      <Card variant="default" className="p-4">
        <Text className="font-['PPNeueBit-Bold'] text-center text-sm text-[#1A2A22]/60">
          Loading activities...
        </Text>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card variant="default" className="p-4">
        <Text className="font-['PPNeueBit-Bold'] text-center text-sm text-[#1A2A22]/60">
          No activity yet
        </Text>
        <Text className="mt-2 font-['PPNeueBit-Bold'] text-center text-xs text-[#1A2A22]/40">
          Start participating in governance to earn reputation!
        </Text>
      </Card>
    );
  }

  return (
    <View>
      <Text className="mb-3 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-white/60">
        Activity
      </Text>
      <Card variant="default">
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <ActivityItem
              activity={item}
              isLast={index === activities.length - 1}
            />
          )}
        />
      </Card>
    </View>
  );
}

/**
 * Single activity item
 */
function ActivityItem({
  activity,
  isLast,
}: {
  activity: ActivityDisplay;
  isLast: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 p-4 ${!isLast ? 'border-b-2 border-black/10' : ''}`}
    >
      {/* Icon */}
      <View className="h-10 w-10 items-center justify-center border-2 border-black bg-[#F3F6F4]">
        <Text className="text-lg">{activity.icon}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`font-['PPNeueBit-Bold'] text-sm ${activity.isRankUp ? 'text-[#B8860B]' : 'text-[#1A2A22]'}`}
        >
          {activity.title}
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/50">
          {activity.description}
        </Text>
      </View>

      {/* Points */}
      <View className="items-end">
        <Text
          className={`font-['PPNeueBit-Bold'] text-sm ${
            activity.points > 0
              ? 'text-[#10B981]'
              : activity.points < 0
                ? 'text-[#FF006E]'
                : 'text-[#1A2A22]/40'
          }`}
        >
          {activity.pointsDisplay}
        </Text>
      </View>
    </View>
  );
}

/**
 * Compact activity preview (for dashboard)
 */
export function ActivityPreview({
  activities,
  maxItems = 3,
}: {
  activities: Array<ActivityDisplay>;
  maxItems?: number;
}) {
  const previewItems = activities.slice(0, maxItems);

  if (previewItems.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      {previewItems.map((activity) => (
        <View key={activity.id} className="flex-row items-center gap-2">
          <Text className="text-sm">{activity.icon}</Text>
          <Text className="flex-1 font-['PPNeueBit-Bold'] text-xs text-white/80" numberOfLines={1}>
            {activity.title}
          </Text>
          <Text
            className={`font-['PPNeueBit-Bold'] text-xs ${
              activity.points > 0 ? 'text-[#00FF80]' : 'text-white/40'
            }`}
          >
            {activity.pointsDisplay}
          </Text>
        </View>
      ))}
    </View>
  );
}
