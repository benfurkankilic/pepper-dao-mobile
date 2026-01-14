import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { ProposalCard } from '@/components/governance';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';
import { useGovernanceProposals } from '@/hooks/use-governance';
import type { GovernanceProposal, GovernanceProposalType } from '@/types/governance';

type ProposalTypeFilter = 'ALL' | 'ADMIN' | 'PEP';

const FILTER_TABS: Array<{ key: ProposalTypeFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ADMIN', label: 'Admin' },
  { key: 'PEP', label: 'Pepper Evolution' },
];

export default function GovernanceScreen() {
  const [activeTab, setActiveTab] = useState<ProposalTypeFilter>('ALL');

  const { data: allProposals, isLoading, isError, refetch } = useGovernanceProposals({});

  // Filter proposals by type
  const proposals = allProposals?.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.type === activeTab;
  });

  function renderContent() {
    if (isLoading && !proposals) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="mt-4 text-xs uppercase tracking-wider text-white">
            Loading proposals...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="mb-3 text-sm text-white">
            Unable to load governance proposals.
          </Text>
          <Pressable
            onPress={() => {
              void refetch();
            }}
            className="border-4 border-white bg-[#FF006E] px-6 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Text className="text-xs font-bold uppercase tracking-wider text-white">
              Retry
            </Text>
          </Pressable>
        </View>
      );
    }

    if (!proposals || proposals.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Text className="mb-2 text-sm text-white">
            No proposals yet.
          </Text>
          <Text className="text-xs text-white/80">
            New governance proposals will appear here.
          </Text>
        </View>
      );
    }

    return (
      <FlashList<GovernanceProposal>
        data={proposals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View className="mb-4">
            <ProposalCard proposal={item} />
          </View>
        )}
      />
    );
  }

  return (
    <ThemedView
      className="flex-1"
      style={{ backgroundColor: FOREST_GREEN }}
    >
      <View className="flex-1 px-4 pb-6 pt-12">
        <View className="mb-6 flex-row items-center">
          <View className="flex-1 pr-4">
            <ThemedText
              type="display"
              lightColor="#FFFFFF"
              className="mb-1 font-bold text-white"
            >
              Proposals
            </ThemedText>
            <Text className="text-xs text-white/80">
              Review Pepper DAO governance proposals created in Aragon.
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 2,
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
            marginBottom: 16,
          }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginRight: 8,
                  borderBottomWidth: 3,
                  borderBottomColor: isActive ? '#FFEA00' : 'transparent',
                  marginBottom: -2,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </ThemedView>
  );
}


