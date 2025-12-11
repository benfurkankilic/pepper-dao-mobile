import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { ProposalStatusPill } from '@/components/governance';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';
import { useGovernanceProposal } from '@/hooks/use-governance';

function shortenAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function GovernanceProposalDetailScreen() {
  const params = useLocalSearchParams<{ proposalId?: string }>();
  const proposalId = params.proposalId;

  const { data: proposal, isLoading } = useGovernanceProposal({
    proposalId,
  });

  return (
    <ThemedView
      className="flex-1"
      style={{ backgroundColor: FOREST_GREEN }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View
          style={{
            backgroundColor: '#111827',
            borderWidth: 4,
            borderColor: '#FFFFFF',
            padding: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6,
          }}
        >
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 }}>
              Proposal Details
            </Text>
          </View>

          {isLoading && !proposal ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={{ marginTop: 12, fontSize: 12, color: '#FFFFFF' }}>
                Loading proposal details...
              </Text>
            </View>
          ) : null}

          {!isLoading && !proposal ? (
            <View style={{ paddingVertical: 24 }}>
              <Text style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}>
                Proposal could not be found.
              </Text>
            </View>
          ) : null}

          {proposal ? (
            <View>
              {/* Key */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFEA00', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  {proposal.key}
                </Text>
              </View>

              {/* Status and Type */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                <ProposalStatusPill status={proposal.status} />
                {proposal.type === 'PEP' ? (
                  <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Community
                  </Text>
                ) : proposal.type === 'MULTISIG' ? (
                  <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Multisig
                  </Text>
                ) : null}
              </View>

              {/* Title */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Title
                </Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>
                  {proposal.title}
                </Text>
              </View>

              {/* Description */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Description
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 20 }}>
                  {proposal.description}
                </Text>
              </View>

              {/* Approvals */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Approvals
                </Text>
                <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
                  {proposal.approvals} / {proposal.minApprovals} required
                </Text>
              </View>

              {/* Time Label */}
              {proposal.timeLabel ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Timeline
                  </Text>
                  <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
                    {proposal.timeLabel}
                  </Text>
                </View>
              ) : null}

              {/* Proposer */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Created By
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
                  {shortenAddress(proposal.proposer)}
                </Text>
              </View>

              {/* Actions */}
              <View>
                <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Actions
                </Text>
                {proposal.actions.map((action, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: '#FFEA00',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 4 }}>
                      Action #{index + 1}
                    </Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 2 }}>
                      To: <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{shortenAddress(action.to)}</Text>
                    </Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)' }}>
                      Value: <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{action.value}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}


