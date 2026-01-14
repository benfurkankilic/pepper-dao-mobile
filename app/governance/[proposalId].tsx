import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import {
    ProposalStatusPill,
    ThresholdIndicators,
    VoteButtons,
    VotingBreakdown,
} from '@/components/governance';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';
import { useGovernanceProposal } from '@/hooks/use-governance';
import { formatBasisPointsAsPercentage } from '@/lib/voting-calculations';
import type { GovernanceProposal } from '@/types/governance';

const CHILIZ_EXPLORER_URL = 'https://chiliscan.com';

function shortenAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function openAddressInExplorer(address: string): void {
  Linking.openURL(`${CHILIZ_EXPLORER_URL}/address/${address}`);
}

type TabType = 'details' | 'voting' | 'settings' | 'actions';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton(props: TabButtonProps) {
  const { label, isActive, onPress } = props;

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 border-b-4 py-3"
      style={{
        borderBottomColor: isActive ? '#FFEA00' : 'transparent',
      }}
    >
      <Text
        className="text-center text-[11px] font-bold uppercase tracking-wider"
        style={{
          color: isActive ? '#FFEA00' : 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface DetailsTabProps {
  proposal: GovernanceProposal;
}

function DetailsTab(props: DetailsTabProps) {
  const { proposal } = props;

  return (
    <View className="p-4">
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

      {/* Approvals - different display for ADMIN vs other types */}
      {proposal.type === 'ADMIN' ? (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
            Execution
          </Text>
          <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' }}>
            Automatic execution
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
            Proposals created by admins pass automatically without any governance.
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
            Approvals
          </Text>
          <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
            {proposal.approvals} / {proposal.minApprovals} required
          </Text>
        </View>
      )}

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
          Proposed By
        </Text>
        <Pressable
          onPress={() => openAddressInExplorer(proposal.proposer)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Text style={{ fontSize: 12, color: '#60A5FA' }}>
            {shortenAddress(proposal.proposer)}
          </Text>
          <Text style={{ fontSize: 10, color: '#60A5FA' }}>↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface VotingTabProps {
  proposal: GovernanceProposal;
}

function VotingTab(props: VotingTabProps) {
  const { proposal } = props;

  // ADMIN proposals have automatic execution - no voting
  if (proposal.type === 'ADMIN') {
    return (
      <View className="p-4">
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#FFEA00',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 }}>
            Automatic execution
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 20 }}>
            Proposals created by admins pass automatically without any governance.
          </Text>
        </View>
      </View>
    );
  }

  if (!proposal.tally || !proposal.votingSettings || !proposal.totalVotingPower) {
    return (
      <View className="p-4">
        <Text className="text-center text-[12px] text-white/60">
          No voting data available
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Voting Breakdown */}
      <VotingBreakdown
        tally={proposal.tally}
        totalVotingPower={proposal.totalVotingPower}
      />

      {/* Divider */}
      <View
        style={{
          height: 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Threshold Indicators */}
      <ThresholdIndicators
        tally={proposal.tally}
        votingSettings={proposal.votingSettings}
        totalVotingPower={proposal.totalVotingPower}
      />

      {/* Divider */}
      <View
        style={{
          height: 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Vote Buttons */}
      <VoteButtons
        disabled={proposal.status !== 'ACTIVE'}
        userVote={proposal.userVote?.voteOption}
      />
    </View>
  );
}

interface SettingsTabProps {
  proposal: GovernanceProposal;
}

function SettingsTab(props: SettingsTabProps) {
  const { proposal } = props;

  if (!proposal.votingSettings) {
    return (
      <View className="p-4">
        <Text className="text-center text-[12px] text-white/60">
          No settings available
        </Text>
      </View>
    );
  }

  const { votingSettings } = proposal;

  return (
    <View className="p-4">
      <Text className="mb-4 text-[12px] font-bold uppercase tracking-wider text-white">
        Voting Settings
      </Text>

      {/* Support Threshold */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          Support Threshold
        </Text>
        <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
          {formatBasisPointsAsPercentage(votingSettings.supportThreshold)}
        </Text>
        <Text style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
          Minimum support required to pass
        </Text>
      </View>

      {/* Min Participation */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          Minimum Participation
        </Text>
        <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
          {formatBasisPointsAsPercentage(votingSettings.minParticipation)}
        </Text>
        <Text style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
          Minimum voter turnout required
        </Text>
      </View>

      {/* Min Duration */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          Minimum Duration
        </Text>
        <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
          {Math.floor(votingSettings.minDuration / 86400)} days
        </Text>
        <Text style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
          Minimum voting period
        </Text>
      </View>

      {/* Total Voting Power */}
      {proposal.totalVotingPower ? (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
            Total Voting Power
          </Text>
          <Text style={{ fontSize: 14, color: '#FFFFFF' }}>
            {(Number(proposal.totalVotingPower) / 1e18).toFixed(0)} CTV
          </Text>
          <Text style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>
            At snapshot block
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface ActionsTabProps {
  proposal: GovernanceProposal;
}

function ActionsTab(props: ActionsTabProps) {
  const { proposal } = props;

  if (proposal.actions.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-center text-[12px] text-white/60">
          No actions to execute
        </Text>
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="mb-4 text-[12px] font-bold uppercase tracking-wider text-white">
        Actions ({proposal.actions.length})
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
  );
}

export default function GovernanceProposalDetailScreen() {
  const params = useLocalSearchParams<{ proposalId?: string }>();
  const proposalId = params.proposalId;
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const { data: proposal, isLoading } = useGovernanceProposal({
    proposalId,
  });

  function renderTabContent() {
    if (!proposal) {
      return null;
    }

    switch (activeTab) {
      case 'details':
        return <DetailsTab proposal={proposal} />;
      case 'voting':
        return <VotingTab proposal={proposal} />;
      case 'settings':
        return <SettingsTab proposal={proposal} />;
      case 'actions':
        return <ActionsTab proposal={proposal} />;
      default:
        return null;
    }
  }

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
            shadowColor: '#000000',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6,
          }}
        >
          {/* Header */}
          <View style={{ padding: 16, borderBottomWidth: 2, borderBottomColor: '#FFFFFF' }}>
            {isLoading && !proposal ? (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={{ marginTop: 12, fontSize: 12, color: '#FFFFFF' }}>
                  Loading proposal...
                </Text>
              </View>
            ) : !proposal ? (
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center' }}>
                  Proposal not found
                </Text>
              </View>
            ) : (
              <View>
                {/* Key */}
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFEA00', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {proposal.key}
                  </Text>
                </View>

                {/* Status and Type */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ProposalStatusPill status={proposal.status} />
                  {proposal.type === 'PEP' ? (
                    <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>
                      Community
                    </Text>
                  ) : proposal.type === 'MULTISIG' ? (
                    <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>
                      Multisig
                    </Text>
                  ) : proposal.type === 'ADMIN' ? (
                    <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>
                      Admin
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          {/* Tabs */}
          {proposal ? (
            <>
              <View className="flex-row border-b-2 border-white">
                <TabButton
                  label="Details"
                  isActive={activeTab === 'details'}
                  onPress={() => setActiveTab('details')}
                />
                {/* Only show Voting and Settings tabs for non-ADMIN proposals */}
                {proposal.type !== 'ADMIN' ? (
                  <>
                    <TabButton
                      label="Voting"
                      isActive={activeTab === 'voting'}
                      onPress={() => setActiveTab('voting')}
                    />
                    <TabButton
                      label="Settings"
                      isActive={activeTab === 'settings'}
                      onPress={() => setActiveTab('settings')}
                    />
                  </>
                ) : null}
                <TabButton
                  label="Actions"
                  isActive={activeTab === 'actions'}
                  onPress={() => setActiveTab('actions')}
                />
              </View>

              {/* Tab Content */}
              {renderTabContent()}
            </>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}


