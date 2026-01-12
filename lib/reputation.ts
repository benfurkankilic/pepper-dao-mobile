/**
 * Reputation System
 *
 * Point values, rank thresholds, and reputation calculation logic.
 */

import type { Activity, EventType, Profile, Rank, RankDisplay } from '@/types/user';

/**
 * Points awarded for each event type
 */
export const REPUTATION_POINTS: Record<EventType, number> = {
  FIRST_VOTE: 20,
  VOTE: 10,
  PROPOSAL_SUBMITTED: 0, // No points until engagement (anti-spam)
  PROPOSAL_ENGAGED: 25,
  PROPOSAL_PASSED: 75,
  PROPOSAL_EXECUTED: 100,
  STREAK_MILESTONE: 0, // Varies by milestone
  STREAK_BROKEN: 0,
  RANK_UP: 0,
  STAKING_BONUS: 5, // Per week
  DELEGATION_RECEIVED: 15,
};

/**
 * Streak milestone bonuses (weeks -> points)
 */
export const STREAK_MILESTONES: Record<number, number> = {
  2: 30,
  4: 60,
  8: 120,
  12: 200,
};

/**
 * Points for streaks beyond 12 weeks (every 4 weeks)
 */
export const STREAK_BONUS_AFTER_12 = 75;

/**
 * Rank thresholds and requirements
 */
export interface RankRequirement {
  points: number;
  requiresWallet: boolean;
  requiresVote: boolean;
  requiresStreak: number; // Minimum streak weeks
  requiresEngagedProposal: boolean;
  requiresPassedProposal: boolean;
}

export const RANK_REQUIREMENTS: Record<Rank, RankRequirement> = {
  OBSERVER: {
    points: 0,
    requiresWallet: false,
    requiresVote: false,
    requiresStreak: 0,
    requiresEngagedProposal: false,
    requiresPassedProposal: false,
  },
  MEMBER: {
    points: 0,
    requiresWallet: true,
    requiresVote: false,
    requiresStreak: 0,
    requiresEngagedProposal: false,
    requiresPassedProposal: false,
  },
  PARTICIPANT: {
    points: 50,
    requiresWallet: false,
    requiresVote: true,
    requiresStreak: 0,
    requiresEngagedProposal: false,
    requiresPassedProposal: false,
  },
  STEWARD: {
    points: 250,
    requiresWallet: false,
    requiresVote: true,
    requiresStreak: 4,
    requiresEngagedProposal: false,
    requiresPassedProposal: false,
  },
  INITIATOR: {
    points: 500,
    requiresWallet: false,
    requiresVote: true,
    requiresStreak: 0,
    requiresEngagedProposal: true,
    requiresPassedProposal: false,
  },
  GOVERNOR: {
    points: 1000,
    requiresWallet: false,
    requiresVote: true,
    requiresStreak: 0,
    requiresEngagedProposal: false,
    requiresPassedProposal: true,
  },
};

/**
 * Rank labels for display
 */
export const RANK_LABELS: Record<Rank, string> = {
  OBSERVER: 'Observer',
  MEMBER: 'Member',
  PARTICIPANT: 'Participant',
  STEWARD: 'Steward',
  INITIATOR: 'Initiator',
  GOVERNOR: 'Governor',
};

/**
 * Rank order for comparison
 */
export const RANK_ORDER: Array<Rank> = [
  'OBSERVER',
  'MEMBER',
  'PARTICIPANT',
  'STEWARD',
  'INITIATOR',
  'GOVERNOR',
];

/**
 * Get points for a specific event type
 */
export function getPointsForEvent(eventType: EventType): number {
  return REPUTATION_POINTS[eventType];
}

/**
 * Get streak milestone points
 */
export function getStreakMilestonePoints(weeks: number): number {
  if (STREAK_MILESTONES[weeks]) {
    return STREAK_MILESTONES[weeks];
  }

  // After 12 weeks, award points every 4 weeks
  if (weeks > 12 && weeks % 4 === 0) {
    return STREAK_BONUS_AFTER_12;
  }

  return 0;
}

/**
 * Check if a week count is a milestone
 */
export function isStreakMilestone(weeks: number): boolean {
  return getStreakMilestonePoints(weeks) > 0;
}

/**
 * Get the next streak milestone
 */
export function getNextStreakMilestone(currentWeeks: number): { weeks: number; points: number } | null {
  const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);

  for (const milestone of milestones) {
    if (milestone > currentWeeks) {
      return { weeks: milestone, points: STREAK_MILESTONES[milestone] };
    }
  }

  // After all defined milestones, next is at next 4-week interval after 12
  if (currentWeeks >= 12) {
    const nextMilestone = Math.ceil((currentWeeks + 1) / 4) * 4;
    if (nextMilestone > currentWeeks) {
      return { weeks: nextMilestone, points: STREAK_BONUS_AFTER_12 };
    }
  }

  return null;
}

/**
 * Get rank level (1-6)
 */
export function getRankLevel(rank: Rank): number {
  return RANK_ORDER.indexOf(rank) + 1;
}

/**
 * Get next rank
 */
export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex < RANK_ORDER.length - 1) {
    return RANK_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * Calculate points needed for next rank
 */
export function getPointsToNextRank(profile: Profile): number | null {
  const nextRank = getNextRank(profile.rank);
  if (!nextRank) return null;

  const nextRequirement = RANK_REQUIREMENTS[nextRank];
  const pointsNeeded = nextRequirement.points - profile.reputation_points;

  return Math.max(0, pointsNeeded);
}

/**
 * Get rank display info
 */
export function getRankDisplay(profile: Profile): RankDisplay {
  const nextRank = getNextRank(profile.rank);
  const pointsToNext = getPointsToNextRank(profile);

  return {
    rank: profile.rank,
    label: RANK_LABELS[profile.rank],
    level: getRankLevel(profile.rank),
    maxLevel: RANK_ORDER.length,
    nextRank,
    pointsToNext,
  };
}

/**
 * Format points for display
 */
export function formatPoints(points: number): string {
  if (points === 0) return '--';
  return points > 0 ? `+${points}` : `${points}`;
}

/**
 * Get event display title
 */
export function getEventTitle(activity: Activity): string {
  switch (activity.event_type) {
    case 'FIRST_VOTE':
      return 'First Vote!';
    case 'VOTE':
      return `Voted on Proposal #${activity.proposal_id}`;
    case 'PROPOSAL_SUBMITTED':
      return `Submitted Proposal #${activity.proposal_id}`;
    case 'PROPOSAL_ENGAGED':
      return `Proposal #${activity.proposal_id} reached engagement`;
    case 'PROPOSAL_PASSED':
      return `Proposal #${activity.proposal_id} passed!`;
    case 'PROPOSAL_EXECUTED':
      return `Proposal #${activity.proposal_id} executed!`;
    case 'STREAK_MILESTONE': {
      const weeks = (activity.metadata as { weeks?: number })?.weeks || 0;
      return `${weeks}-week streak!`;
    }
    case 'STREAK_BROKEN':
      return 'Streak ended';
    case 'RANK_UP':
      return `Reached ${RANK_LABELS[activity.rank_after!]} rank!`;
    case 'STAKING_BONUS':
      return 'Staking bonus';
    case 'DELEGATION_RECEIVED':
      return 'Received delegation';
    default:
      return 'Activity';
  }
}

/**
 * Get event icon
 */
export function getEventIcon(eventType: EventType): string {
  switch (eventType) {
    case 'FIRST_VOTE':
    case 'VOTE':
      return '🗳️';
    case 'PROPOSAL_SUBMITTED':
    case 'PROPOSAL_ENGAGED':
    case 'PROPOSAL_PASSED':
    case 'PROPOSAL_EXECUTED':
      return '📜';
    case 'STREAK_MILESTONE':
      return '🔥';
    case 'STREAK_BROKEN':
      return '💔';
    case 'RANK_UP':
      return '⭐';
    case 'STAKING_BONUS':
      return '💎';
    case 'DELEGATION_RECEIVED':
      return '🤝';
    default:
      return '📌';
  }
}
