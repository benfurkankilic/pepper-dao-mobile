import { Image, type ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { TreasuryTransactionsModal } from '@/components/home/treasury-transactions-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PepperTokenMetrics } from '@/config/pepper-token';
import { DANGER_RED, FOREST_GREEN, SUCCESS_GREEN } from '@/constants/theme';
import { usePepperTokenMetrics } from '@/hooks/use-pepper-token-metrics';
import {
  calculateBurnedFromOriginalSupply,
  formatPepperAmount,
  formatTreasuryChzDelta,
} from '@/lib/pepper-metrics';
import { telemetry } from '@/lib/telemetry';

const ICON_TOTAL_SUPPLY = require('@/assets/images/pepper/total-supply.png');
const ICON_TREASURY = require('@/assets/images/pepper/treasury.png');
const ICON_VAULT = require('@/assets/images/pepper/vault.png');
const ICON_BURN = require('@/assets/images/pepper/burn.png');

interface PepperDashboardProps {
  showHeader?: boolean;
}

export function PepperDashboard({ showHeader = true }: PepperDashboardProps) {
  const { metrics, isError, isFetching, lastUpdated } =
    usePepperTokenMetrics();

  const [isTreasuryModalVisible, setIsTreasuryModalVisible] =
    useState<boolean>(false);

  const decimals = metrics?.decimals ?? 18;

  useEffect(() => {
    telemetry.trackPepperDashboardViewed();
  }, []);

  return (
    <ThemedView className="mt-16 w-full">
      <Card
        elevation="lg"
        className="w-full border-4 border-white p-6"
        style={{ backgroundColor: FOREST_GREEN }}
      >
        {showHeader ? (
          <View className="mb-6 items-center">
            {/* <Image
              source={ICON_LOGO}
              style={{ width: 72, height: 72, marginBottom: 12 }}
              contentFit="contain"
            /> */}
            <ThemedText
              type="display"
              lightColor="#FFFFFF"
              className="text-center font-bold"
            >
              $PEPPER IS FOR THE PEOPLE
            </ThemedText>


            <View className="mt-4 flex-row gap-3">
              <Button
                variant="primary"
                onPress={() => {
                  // TODO: Wire actual FanX link via WebBrowser
                }}
                className="flex-1"
              >
                GET PEPPER
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  // TODO: Wire staking / governance deep link
                }}
                className="flex-1"
              >
                STAKE & VOTE
              </Button>
            </View>
          </View>
        ) : null}

        <View className="mt-2">
          <MetricsGrid
            decimals={decimals}
            isError={isError}
            isFetching={isFetching}
            lastUpdated={lastUpdated}
            metrics={metrics ?? null}
            onPressTreasury={() => {
              setIsTreasuryModalVisible(true);
            }}
          />
        </View>
      </Card>

      <TreasuryTransactionsModal
        visible={isTreasuryModalVisible}
        onClose={() => {
          setIsTreasuryModalVisible(false);
        }}
      />
    </ThemedView>
  );
}

interface MetricsGridProps {
  metrics: PepperTokenMetricsOrNull;
  decimals: number;
  isError: boolean;
  isFetching: boolean;
  lastUpdated: string | null;
  onPressTreasury: () => void;
}

function MetricsGrid({
  metrics,
  decimals,
  isError,
  isFetching,
  lastUpdated,
  onPressTreasury,
}: MetricsGridProps) {
  const hasData = metrics !== null;

  return (
    <View>
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <ThemedText
            type="subtitle"
            lightColor="#FFFFFF"
            className="font-bold"
          >
            Treasury Snapshot
          </ThemedText>
          {/* <ThemedText
            type="caption"
            lightColor="#E5FFF4"
            className="text-xs"
          >
            {lastUpdated
              ? `Last updated ${formatTimeSince(lastUpdated)} ago`
              : 'Waiting for first snapshot...'}
          </ThemedText> */}
        </View>

        {/* Small pulse indicator when background refresh is running */}
        {isFetching ? (
          <View className="h-3 w-3 rounded-full bg-mint" />
        ) : null}
      </View>

      <View className="flex-col gap-4">
        <MetricTile
          label="Pepper Supply"
          value={hasData ? formatPepperAmount(metrics.totalSupply, decimals) : '–'}
          icon={ICON_TOTAL_SUPPLY}
        />
        <MetricTile
          label="Treasury (CHZ)"
          value={
            hasData
              ? `${formatPepperAmount(metrics.treasuryChzBalance, 18)} CHZ`
              : '–'
          }
          subtitle={
            hasData && metrics.treasuryChzDelta !== null
              ? formatTreasuryChzDelta(metrics.treasuryChzDelta)
              : null
          }
          subtitleColor={
            hasData && metrics.treasuryChzDelta !== null
              ? metrics.treasuryChzDelta > BigInt(0)
                ? SUCCESS_GREEN
                : metrics.treasuryChzDelta < BigInt(0)
                  ? DANGER_RED
                  : undefined
              : undefined
          }
          onPress={onPressTreasury}
          icon={ICON_TREASURY}
        />
        <MetricTile
          label="Staked Pepper"
          value={
            hasData && metrics.hasStakedData
              ? formatPepperAmount(metrics.stakedAmount, decimals)
              : '–'
          }
          icon={ICON_VAULT}
        />
        <MetricTile
          label="Burnt Pepper"
          value={
            hasData
              ? formatPepperAmount(
                  calculateBurnedFromOriginalSupply(metrics.totalSupply, decimals),
                  0,
                )
              : '–'
          }
          icon={ICON_BURN}
        />
      </View>

      {isError ? (
        <View className="mt-3">
          <ThemedText
            type="caption"
            lightColor="#FFB3B3"
            className="text-xs"
          >
            Showing latest available data
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  icon: ImageSource;
  subtitle?: string | null;
  subtitleColor?: string;
  onPress?: () => void;
}

function MetricTile({
  label,
  value,
  subtitle,
  subtitleColor,
  onPress,
  icon,
}: MetricTileProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      className="w-full flex-row gap-4 rounded-none border-2 border-white bg-surface-alt px-3 py-4 shadow-[3px_3px_0px_#000000]"
    >
      <Image
        source={icon}
        style={{ width: 48, height: 48 }}
        contentFit="contain"
      />
      <View className="flex-1">
        <ThemedText type="caption">
          {label.toUpperCase()}
        </ThemedText>
        <View className="flex-row items-end gap-2">
          <ThemedText type="title">
            {value}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              type="caption"
              lightColor={subtitleColor}
              className="text-xs mb-2"
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

type PepperTokenMetricsOrNull = PepperTokenMetrics | null;
