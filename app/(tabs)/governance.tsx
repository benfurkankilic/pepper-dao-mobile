import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { ProposalCard } from '@/components/governance';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';
import { useGovernanceProposals } from '@/hooks/use-governance';
import type { GovernanceProposal, GovernanceProposalType } from '@/types/governance';

type GovernanceFilterTab = 'ALL' | 'ADMIN' | 'PEPPER_EVOLUTION';

function getFilterLabel(tab: GovernanceFilterTab): string {
  if (tab === 'ADMIN') return 'Admin';
  if (tab === 'PEPPER_EVOLUTION') return 'Pepper Evolution Proposal';
  return 'All proposals';
}

function getProposalTypeFromTab(tab: GovernanceFilterTab): GovernanceProposalType | 'ALL' {
  if (tab === 'ADMIN') return 'ADMIN';
  if (tab === 'PEPPER_EVOLUTION') return 'PEPPER_EVOLUTION';
  return 'ALL';
}

export default function GovernanceScreen() {
  const [activeTab, setActiveTab] = useState<GovernanceFilterTab>('ALL');

  const proposalType: GovernanceProposalType | 'ALL' = getProposalTypeFromTab(activeTab);

  const { data: proposals, isLoading, isError, refetch } = useGovernanceProposals({
    status: 'ALL',
    type: proposalType,
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

        <View className="mb-4 rounded-none border-4 border-white bg-[#1a1a1a] p-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row' }}
          >
            {(['ALL', 'ADMIN', 'PEPPER_EVOLUTION'] as Array<GovernanceFilterTab>).map((tab) => {
              const isActive: boolean = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`mr-2 px-4 py-2 border-2 border-gray-400 ${
                    isActive ? 'bg-[#FF006E]' : ''
                  }`}
                >
                  <Text
                    className={`text-center text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}
                  >
                    {getFilterLabel(tab)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </ThemedView>
  );
}


