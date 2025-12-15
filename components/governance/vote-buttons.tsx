import { Pressable, Text, View } from 'react-native';

import type { VoteOption } from '@/types/governance';

interface VoteButtonsProps {
  onVote?: (option: VoteOption) => void;
  userVote?: VoteOption;
  disabled?: boolean;
}

interface VoteButtonProps {
  label: string;
  option: VoteOption;
  color: string;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function VoteButton(props: VoteButtonProps) {
  const { label, isSelected, disabled, onPress, color } = props;

  const backgroundColor = isSelected ? color : '#111827';
  const borderColor = isSelected ? color : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="mb-3 border-4 p-4 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="text-[13px] font-bold uppercase tracking-wider"
          style={{
            color: isSelected ? '#000000' : '#FFFFFF',
          }}
        >
          {label}
        </Text>
        {isSelected ? (
          <Text className="text-[16px]" style={{ color: '#000000' }}>
            ✓
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function VoteButtons(props: VoteButtonsProps) {
  const { onVote, userVote = 'NONE', disabled = false } = props;

  function handleVote(option: VoteOption) {
    if (!disabled && onVote) {
      onVote(option);
    }
  }

  return (
    <View className="p-4">
      {/* Title */}
      <Text className="mb-4 text-[12px] font-bold uppercase tracking-wider text-white">
        Cast Your Vote
      </Text>

      {/* Vote Options */}
      <VoteButton
        label="Yes to approve"
        option="YES"
        color="#00FF80"
        isSelected={userVote === 'YES'}
        disabled={disabled}
        onPress={() => handleVote('YES')}
      />

      <VoteButton
        label="Abstain"
        option="ABSTAIN"
        color="#6B7280"
        isSelected={userVote === 'ABSTAIN'}
        disabled={disabled}
        onPress={() => handleVote('ABSTAIN')}
      />

      <VoteButton
        label="No to approve"
        option="NO"
        color="#FF006E"
        isSelected={userVote === 'NO'}
        disabled={disabled}
        onPress={() => handleVote('NO')}
      />

      {/* Info Message */}
      {disabled ? (
        <View className="mt-2 border-l-4 border-[#FFEA00] bg-[#FFEA00]/10 p-3">
          <Text className="text-[10px] text-white/80">
            {userVote !== 'NONE'
              ? 'You have already voted on this proposal'
              : 'Voting is not available for this proposal'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
