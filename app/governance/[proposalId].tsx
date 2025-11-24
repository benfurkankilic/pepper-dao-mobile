import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { FOREST_GREEN } from '@/constants/theme';
import { useGovernanceProposal } from '@/hooks/use-governance';

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
      <ScrollView contentContainerClassName="p-4 pb-10">
        <Card
          elevation="lg"
          className="border-4 border-white bg-[#111827] p-4"
        >
          <View className="mb-3">
            <ThemedText
              type="subtitle"
              lightColor="#FFFFFF"
              className="text-xs font-bold uppercase tracking-wider text-white"
            >
              Proposal
            </ThemedText>
          </View>

          {isLoading && !proposal ? (
            <Text className="text-sm text-white">
              Loading proposal details...
            </Text>
          ) : null}

          {!isLoading && !proposal ? (
            <Text className="text-sm text-white">
              Proposal could not be found.
            </Text>
          ) : null}

          {proposal ? (
            <View className="space-y-3">
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-wider text-[#FFEA00]">
                  {proposal.key}
                </Text>
                <Text className="mt-1 text-base font-bold text-white">
                  {proposal.title}
                </Text>
              </View>

              <View>
                <Text className="mb-1 text-[10px] uppercase text-white/60">
                  Description
                </Text>
                <Text className="text-sm text-white/90">
                  {proposal.description}
                </Text>
              </View>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}


