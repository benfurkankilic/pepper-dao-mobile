import { PEPPER_ORIGINAL_SUPPLY } from '@/config/pepper-token';

export function formatPepperAmount(
  rawAmount: bigint,
  decimals: number,
  fractionDigits: number = 0,
): string {
  const factor = bigIntPow10(decimals);
  const integerPart = rawAmount / factor;
  const fractionalPart = rawAmount % factor;

  const integerString = integerPart.toString().replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );

  if (fractionDigits === 0) {
    return integerString;
  }

  const fractionalString = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, fractionDigits)
    .replace(/0+$/, '');

  if (fractionalString.length === 0) {
    return integerString;
  }

  return `${integerString}.${fractionalString}`;
}

export function calculateBurnedFromOriginalSupply(
  currentTotalSupply: bigint,
  decimals: number,
): bigint {
  const factor = bigIntPow10(decimals);
  const currentTokens = currentTotalSupply / factor;

  if (currentTokens >= PEPPER_ORIGINAL_SUPPLY) {
    return BigInt(0);
  }

  const burnedTokens = PEPPER_ORIGINAL_SUPPLY - currentTokens;

  return burnedTokens;
}

export function formatTreasuryChzDelta(delta: bigint): string {
  if (delta === BigInt(0)) {
    return '';
  }

  const isPositive = delta > BigInt(0);
  const absoluteDelta = isPositive ? delta : -delta;
  const formattedAmount = formatPepperAmount(absoluteDelta, 18);

  return `${isPositive ? '+' : '-'}${formattedAmount} CHZ today`;
}

export function formatTimeSince(timestamp: string): string {
  const updatedAt = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - updatedAt);

  const diffSeconds = Math.floor(diffMs / 1000);

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays}d`;
}

export function formatTimeAgoFromSeconds(timestampSeconds: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const diffSeconds = Math.max(0, nowSeconds - timestampSeconds);

  if (diffSeconds < 60) {
    const seconds = diffSeconds;
    const label = seconds === 1 ? 'second' : 'seconds';
    return `${seconds} ${label} ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    const label = diffMinutes === 1 ? 'minute' : 'minutes';
    return `${diffMinutes} ${label} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    const label = diffHours === 1 ? 'hour' : 'hours';
    return `${diffHours} ${label} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const label = diffDays === 1 ? 'day' : 'days';

  return `${diffDays} ${label} ago`;
}

function bigIntPow10(decimals: number): bigint {
  if (decimals <= 0) {
    return BigInt(1);
  }

  let factor = BigInt(1);

  for (let index = 0; index < decimals; index += 1) {
    factor *= BigInt(10);
  }

  return factor;
}


