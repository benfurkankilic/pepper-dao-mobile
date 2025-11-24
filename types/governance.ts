export type GovernanceStatus = 'ACTIVE' | 'EXECUTED' | 'PENDING' | 'DEFEATED' | 'CANCELLED';

export type GovernanceProposalType = 'ADMIN' | 'PEPPER_EVOLUTION' | 'OTHER';

export interface GovernanceProposal {
  id: string;
  /**
   * Human readable key like PEP-0, ADMIN-2, etc.
   */
  key: string;
  title: string;
  description: string;
  status: GovernanceStatus;
  type: GovernanceProposalType;
  proposer: string;
  createdAt: string;
  executedAt?: string | null;
  /**
   * Optional stage label or context (e.g. \"in Spicy Council Signoff\").
   */
  stageLabel?: string | null;
  /**
   * Optional human friendly time label (e.g. \"7 days left\", \"5 hours ago\").
   * This is mainly used for the archive list UI.
   */
  timeLabel?: string | null;
}

export interface GovernanceProposalFilter {
  status?: GovernanceStatus | 'ALL';
  type?: GovernanceProposalType | 'ALL';
}

export const GOVERNANCE_STATUS_LABELS: Record<GovernanceStatus, string> = {
  ACTIVE: 'Active',
  EXECUTED: 'Executed',
  PENDING: 'Pending',
  DEFEATED: 'Defeated',
  CANCELLED: 'Cancelled',
};


