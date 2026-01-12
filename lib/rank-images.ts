/**
 * Rank Images
 *
 * Maps rank tiers to their corresponding pixel art character images.
 */

import type { Rank } from '@/types/user';

export const RANK_IMAGES: Record<Rank, ReturnType<typeof require>> = {
  OBSERVER: require('@/assets/images/ranks/observer.png'),
  MEMBER: require('@/assets/images/ranks/member.png'),
  PARTICIPANT: require('@/assets/images/ranks/participant.png'),
  STEWARD: require('@/assets/images/ranks/steward.png'),
  INITIATOR: require('@/assets/images/ranks/initiator.png'),
  GOVERNOR: require('@/assets/images/ranks/governor.png'),
};
