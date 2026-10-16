import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useGovernanceProposal } from '@/hooks/use-governance';
import { REPUTATION_POINTS } from '@/lib/reputation';
import {
  basisPointsToPercentage,
  calculateCurrentSupport,
  calculateParticipation,
} from '@/lib/voting-calculations';
import type { GovernanceProposal, VoteOption } from '@/types/governance';

import { DashedDivider, Tag } from '../components/atoms';
import { Panel } from '../components/panel';
import { getVoteBarColors, PixelBar } from '../components/pixel-bar';
import { PixelButton } from '../components/pixel-button';
import { ThermalScreen } from '../components/thermal-screen';
import { VoteSheet } from '../components/vote-sheet';
import { RepSticker, VoteStamp } from '../components/vote-stamp';
import { useCountUp } from '../hooks/use-count-up';
import { createDemoProposal, isDemoProposalId } from '../lib/demo-vote';
import { formatAgo, formatCompact, formatCountdown, shortenAddress, shortenKey, tokenToNumber } from '../lib/format';
import { getProposalDescription, getProposalStages, getProposalTitle, getTrackLong, getVoteSplit, STAGE_COLORS, STATUS_STYLES } from '../lib/proposal';
import { THERMAL_COLORS, TYPE, VOTE_COLORS } from '../theme';

/**
 * Proposal detail — thermal tally, the approval path and the vote dock.
 * Voting goes through the shared VoteModal (wallet + tx handling); a
 * successful vote slams the VOTED stamp onto the tally.
 */
export function ProposalDetailScreen() {
  const router = useRouter();
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  const isDemo = isDemoProposalId(proposalId);
  const demoProposal = useMemo(() => (isDemo ? createDemoProposal() : null), [isDemo]);
  const query = useGovernanceProposal({ proposalId: isDemo ? undefined : proposalId });
  const proposal = demoProposal ?? query.data;
  const { refetch, isRefetching } = query;
  const isLoading = !isDemo && query.isLoading;
  const isError = !isDemo && query.isError;
  const error = query.error;

  const [pendingOption, setPendingOption] = useState<Exclude<VoteOption, 'NONE'> | null>(null);
  const [freshVote, setFreshVote] = useState<FreshVote | null>(null);

  const canVote = proposal?.type === 'PEP';
  const dockHeight = canVote ? DOCK_HEIGHT : 0;

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/governance');
  }

  function handleSelect(option: Exclude<VoteOption, 'NONE'>) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingOption(option);
  }

  function handleVoteSuccess(txHash: string, option: VoteOption) {
    if (option === 'NONE') return;
    setFreshVote({ option, txHash, date: new Date() });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const recordedOption = freshVote?.option ?? normalizeVote(proposal?.userVote?.voteOption);

  return (
    <ThermalScreen
      preset="detail"
      bottomSpace={dockHeight + 24}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      navBar={{
        title: proposal ? shortenKey(proposal.key) : 'PROPOSAL',
        onBack: handleBack,
      }}
      overlay={
        proposal && canVote ? (
          <VoteDock
            proposal={proposal}
            selected={recordedOption}
            freshTx={freshVote?.txHash ?? null}
            onSelect={handleSelect}
          />
        ) : null
      }
    >

      {isLoading && !proposal ? (
        <View style={styles.center}>
          <ActivityIndicator color={THERMAL_COLORS.gold} />
          <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>READING HEAT SIGNATURE…</Text>
        </View>
      ) : null}

      {isError && !proposal ? (
        <Panel borderColor={THERMAL_COLORS.red}>
          <Text style={TYPE.display24}>Signal lost</Text>
          <Text style={TYPE.body13}>{error?.message ?? 'Unable to load proposal.'}</Text>
          <PixelButton label="RETRY" onPress={() => void refetch()} />
        </Panel>
      ) : null}

      {!isLoading && !isError && !proposal ? (
        <Panel>
          <Text style={TYPE.display24}>Proposal not found</Text>
        </Panel>
      ) : null}

      {proposal ? (
        <>
          <Animated.View style={[styles.row, { gap: 6 }]}>
            <Tag
              label={STATUS_STYLES[proposal.status].label}
              color={STATUS_STYLES[proposal.status].color}
              textColor={STATUS_STYLES[proposal.status].textColor}
            />
            <Tag label={getTrackLong(proposal)} color="rgba(255,255,255,0.6)" variant="outline" />
          </Animated.View>

          <Animated.View style={{ gap: 16 }}>
            <Text style={TYPE.display32}>{getProposalTitle(proposal)}</Text>
            <Pressable onPress={() => void Linking.openURL(`${EXPLORER_URL}/address/${proposal.proposer}`)}>
              <Text style={[TYPE.meta18, { color: 'rgba(255,255,255,0.6)' }]}>
                {`by ${shortenAddress(proposal.proposer)} · ${getTimingLabel(proposal)}`}
              </Text>
            </Pressable>
          </Animated.View>

          <View>
            <ThermalTally proposal={proposal} />
            {recordedOption ? (
              <View pointerEvents="none" style={styles.stampSlot}>
                <VoteStamp
                  key={freshVote?.txHash ?? 'recorded'}
                  option={recordedOption}
                  date={freshVote?.date}
                  slam={Boolean(freshVote)}
                />
              </View>
            ) : null}
            {freshVote ? (
              <View pointerEvents="none" style={styles.stickerSlot}>
                <RepSticker points={REPUTATION_POINTS.VOTE} />
              </View>
            ) : null}
          </View>

          <PathPanel proposal={proposal} />

          {getProposalDescription(proposal) ? (
            <Animated.View style={{ gap: 8 }}>
              <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>SUMMARY</Text>
              <Text style={TYPE.body14}>{getProposalDescription(proposal)}</Text>
            </Animated.View>
          ) : null}

          {proposal.actions.length > 0 ? (
            <Animated.View style={{ gap: 8 }}>
              <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>
                {`ON-CHAIN ACTIONS · ${proposal.actions.length}`}
              </Text>
              {proposal.actions.map((action, index) => (
                <Pressable key={`${action.to}-${index}`} onPress={() => void Linking.openURL(`${EXPLORER_URL}/address/${action.to}`)}>
                  <Text style={[TYPE.meta16, { color: 'rgba(255,255,255,0.6)' }]}>
                    {`${String(index + 1).padStart(2, '0')}  CALL ${shortenAddress(action.to)} ↗`}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          ) : null}

          {canVote ? (
            <VoteSheet
              visible={pendingOption !== null}
              onClose={() => setPendingOption(null)}
              proposal={proposal}
              initialOption={pendingOption ?? undefined}
              onSuccess={handleVoteSuccess}
            />
          ) : null}
        </>
      ) : null}
    </ThermalScreen>
  );
}

function ThermalTally({ proposal }: { proposal: GovernanceProposal }) {
  const split = getVoteSplit(proposal);
  const animatedYes = useCountUp(split.yes, 1100);
  const tally = proposal.tally;
  const settings = proposal.votingSettings;
  const total = proposal.totalVotingPower;

  if (proposal.type === 'ADMIN' || !tally) {
    return (
      <Panel index={2}>
        <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>THERMAL TALLY</Text>
        <Text style={[TYPE.display40, { color: THERMAL_COLORS.cream }]}>
          {proposal.type === 'ADMIN' ? 'AUTO' : 'NO VOTES'}
        </Text>
        <Text style={TYPE.body13}>
          {proposal.type === 'ADMIN'
            ? 'Admin proposals execute automatically without a community vote.'
            : 'No vePEPPER has been cast on this proposal yet.'}
        </Text>
      </Panel>
    );
  }

  const support = basisPointsToPercentage(calculateCurrentSupport(tally));
  const participation = total ? basisPointsToPercentage(calculateParticipation(tally, total)) : null;
  const rows: Array<{ label: string; color: string; percent: number; amount: string }> = [
    { label: 'YES', color: VOTE_COLORS.YES, percent: split.yes, amount: tally.yes },
    { label: 'NO', color: VOTE_COLORS.NO, percent: split.no, amount: tally.no },
    { label: 'ABSTAIN', color: THERMAL_COLORS.mist, percent: split.abstain, amount: tally.abstain },
  ];

  return (
    <Panel index={2}>
      <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>THERMAL TALLY</Text>
      <View style={[styles.row, { alignItems: 'flex-end', gap: 8 }]}>
        <Text style={[TYPE.display58, { color: THERMAL_COLORS.cream }]}>{`${Math.round(animatedYes)}%`}</Text>
        <Text style={[TYPE.label15, { color: THERMAL_COLORS.cream, marginBottom: 6 }]}>YES</Text>
      </View>
      <PixelBar colors={getVoteBarColors(split)} height={14} delay={300} shimmer={proposal.status === 'ACTIVE'} />
      {rows.map((row, index) => (
        <View key={row.label} style={styles.between}>
          <View style={[styles.row, { gap: 8 }]}>
            <View style={{ width: 8, height: 8, backgroundColor: row.color }} />
            <Text style={TYPE.label10}>{row.label}</Text>
          </View>
          <Text style={[TYPE.meta16, { color: 'rgba(255,255,255,0.6)' }]}>
            {`${Math.round(row.percent)}% · ${formatCompact(tokenToNumber(BigInt(row.amount), 18))}${index === 0 ? ' vePEPPER' : ''}`}
          </Text>
        </View>
      ))}
      {settings && settings.supportThreshold > 0 ? (
        <>
          <DashedDivider thickness={1} color="rgba(255,255,255,0.15)" />
          <Text style={[TYPE.meta16, { color: THERMAL_COLORS.gold }]}>
            {`SUPPORT ${Math.round(support)}% / NEEDS ${Math.round(basisPointsToPercentage(settings.supportThreshold))}%`}
          </Text>
          {participation !== null ? (
            <Text style={[TYPE.meta16, { color: THERMAL_COLORS.gold }]}>
              {`PARTICIPATION ${Math.round(participation)}% / QUORUM ${Math.round(basisPointsToPercentage(settings.minParticipation))}%`}
            </Text>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}

function PathPanel({ proposal }: { proposal: GovernanceProposal }) {
  const stages = getProposalStages(proposal);

  return (
    <Panel index={4} gap={10}>
      <Text style={[TYPE.label10, { color: 'rgba(255,255,255,0.6)' }]}>PATH</Text>
      {stages.map((stage, index) => {
        const color = STAGE_COLORS[stage.state];
        const isWaiting = stage.state === 'waiting';
        return (
          <Animated.View
            key={stage.label}
           
            style={[styles.row, { gap: 10 }]}
          >
            <View style={[styles.stepBox, isWaiting ? styles.stepBoxIdle : { backgroundColor: color }]}>
              <Text style={[TYPE.label10, { color: isWaiting ? 'rgba(255,255,255,0.4)' : THERMAL_COLORS.void }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[TYPE.meta18, { color: isWaiting ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)', flexShrink: 1 }]}>
              {stage.detail ? `${stage.label} · ${stage.detail}` : stage.label}
            </Text>
          </Animated.View>
        );
      })}
    </Panel>
  );
}

interface VoteDockProps {
  proposal: GovernanceProposal;
  selected: Exclude<VoteOption, 'NONE'> | null;
  freshTx: string | null;
  onSelect: (option: Exclude<VoteOption, 'NONE'>) => void;
}

function VoteDock({ proposal, selected, freshTx, onSelect }: VoteDockProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isOpen = proposal.status === 'ACTIVE';
  const height = DOCK_HEIGHT + insets.bottom;

  const footer = freshTx
    ? `${isDemoProposalId(proposal.id) ? 'Test vote (not on-chain)' : 'Vote recorded on Chiliz'} · tx ${shortenAddress(freshTx)}`
    : !isOpen
      ? 'Voting is closed for this proposal'
      : selected
        ? `You voted ${selected} · tap to change`
        : 'Your vePEPPER sets the temperature';

  return (
    <Animated.View style={[styles.dock, { height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="dock-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={THERMAL_COLORS.void} stopOpacity={0} />
            <Stop offset="0.3" stopColor={THERMAL_COLORS.void} stopOpacity={0.95} />
            <Stop offset="1" stopColor={THERMAL_COLORS.void} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#dock-fade)" />
      </Svg>
      <View style={[styles.row, styles.dockButtons]}>
        {VOTE_OPTIONS.map((option) => {
          const isSelected = selected === option;
          return (
            <PixelButton
              key={option}
              label={option}
              disabled={!isOpen}
              variant={isSelected ? 'cream' : selected ? 'muted' : 'outline'}
              style={{ flex: 1 }}
              onPress={() => onSelect(option)}
            />
          );
        })}
      </View>
      <Text style={[TYPE.meta16, styles.dockFooter]} numberOfLines={1}>
        {footer}
      </Text>
    </Animated.View>
  );
}

function getTimingLabel(proposal: GovernanceProposal): string {
  if (proposal.status === 'ACTIVE') return `ends in ${formatCountdown(proposal.endDate).toLowerCase()}`;
  if (proposal.status === 'PENDING') return `starts in ${formatCountdown(proposal.startDate).toLowerCase()}`;
  return `ended ${formatAgo(proposal.endDate).toLowerCase()}`;
}

function normalizeVote(option: VoteOption | undefined): Exclude<VoteOption, 'NONE'> | null {
  if (!option || option === 'NONE') return null;
  return option;
}

interface FreshVote {
  option: Exclude<VoteOption, 'NONE'>;
  txHash: string;
  date: Date;
}

const VOTE_OPTIONS: Array<Exclude<VoteOption, 'NONE'>> = ['YES', 'NO', 'ABSTAIN'];
const DOCK_HEIGHT = 128;
const EXPLORER_URL = 'https://chiliscan.com';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  center: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  stampSlot: {
    position: 'absolute',
    top: 34,
    right: 6,
  },
  stickerSlot: {
    position: 'absolute',
    top: 4,
    right: 10,
  },
  stepBox: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  stepBoxIdle: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dockButtons: {
    position: 'absolute',
    top: 36,
    left: 16,
    right: 20,
    gap: 10,
  },
  dockFooter: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
  },
});
