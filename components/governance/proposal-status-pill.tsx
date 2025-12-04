import { Text, View } from 'react-native';

import type { GovernanceStatus } from '@/types/governance';
import { GOVERNANCE_STATUS_LABELS } from '@/types/governance';

interface ProposalStatusPillProps {
  status: GovernanceStatus;
}

function getStatusColors(status: GovernanceStatus): {
  background: string;
  text: string;
} {
  if (status === 'ACTIVE') {
    return {
      background: '#0080FF',
      text: '#FFFFFF',
    };
  }

  if (status === 'EXECUTED') {
    return {
      background: '#00FF80',
      text: '#000000',
    };
  }

  if (status === 'PENDING') {
    return {
      background: '#FFEA00',
      text: '#000000',
    };
  }

  if (status === 'DEFEATED') {
    return {
      background: '#FF006E',
      text: '#FFFFFF',
    };
  }

  if (status === 'SUCCEEDED') {
    return {
      background: '#8B5CF6',
      text: '#FFFFFF',
    };
  }

  return {
    background: '#4B5563',
    text: '#FFFFFF',
  };
}

export function ProposalStatusPill(props: ProposalStatusPillProps) {
  const { status } = props;
  const colors = getStatusColors(status);

  return (
    <View
      className="rounded-none px-2 py-1"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors.text }}
      >
        {GOVERNANCE_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}


