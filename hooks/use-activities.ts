/**
 * useActivities Hook
 *
 * Fetches and manages activity feed data for a user profile.
 */

import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import { formatPoints, getEventIcon, getEventTitle } from '@/lib/reputation';
import type { Activity, ActivityDisplay } from '@/types/user';

interface UseActivitiesOptions {
  profileId: string | undefined;
  limit?: number;
}

interface UseActivitiesReturn {
  activities: Array<ActivityDisplay>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Transform activity row to display format
 */
function toActivityDisplay(activity: Activity): ActivityDisplay {
  return {
    id: activity.id,
    title: getEventTitle(activity),
    description: getEventDescription(activity),
    points: activity.points,
    pointsDisplay: formatPoints(activity.points),
    icon: getEventIcon(activity.event_type),
    timestamp: activity.created_at,
    isRankUp: activity.event_type === 'RANK_UP',
  };
}

/**
 * Get event description
 */
function getEventDescription(activity: Activity): string {
  const date = new Date(activity.created_at);
  const timeAgo = getTimeAgo(date);

  switch (activity.event_type) {
    case 'FIRST_VOTE':
      return `Welcome to governance! ${timeAgo}`;
    case 'VOTE':
      return timeAgo;
    case 'RANK_UP':
      return `You're now a ${activity.rank_after}! ${timeAgo}`;
    case 'STREAK_MILESTONE': {
      const weeks = (activity.metadata as { weeks?: number })?.weeks || 0;
      return `${weeks} weeks of consistent participation`;
    }
    case 'STREAK_BROKEN': {
      const weeks = (activity.metadata as { weeks?: number })?.weeks || 0;
      return `Streak ended at ${weeks} weeks`;
    }
    default:
      return timeAgo;
  }
}

/**
 * Format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

/**
 * Fetch activities from Supabase
 */
async function fetchActivities(profileId: string, limit: number): Promise<Array<Activity>> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[useActivities] Error fetching activities:', error);
    throw error;
  }

  return (data || []) as Array<Activity>;
}

/**
 * Hook to fetch user activities
 */
export function useActivities({ profileId, limit = 20 }: UseActivitiesOptions): UseActivitiesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities', profileId, limit],
    queryFn: () => fetchActivities(profileId!, limit),
    enabled: !!profileId,
    staleTime: 30000, // 30 seconds
  });

  const activities = (data || []).map(toActivityDisplay);

  return {
    activities,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch recent activity count (for badges/indicators)
 */
export function useRecentActivityCount(profileId: string | undefined, hours = 24): number {
  const { data } = useQuery({
    queryKey: ['activities', 'count', profileId, hours],
    queryFn: async () => {
      if (!profileId) return 0;

      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .gte('created_at', since);

      if (error) {
        console.error('[useRecentActivityCount] Error:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!profileId,
    staleTime: 60000, // 1 minute
  });

  return data || 0;
}
