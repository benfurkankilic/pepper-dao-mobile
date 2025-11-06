/**
 * Telemetry System for Pepper DAO
 * Tracks user actions and events for analytics
 * 
 * Events follow the specification from wallet-and-onboarding.md
 */

/**
 * Wallet-related telemetry events
 */
export const TELEMETRY_EVENTS = {
  // Wallet connection events
  WALLET_CONNECT_OPENED: 'wallet_connect_opened',
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_DISCONNECTED: 'wallet_disconnected',
  WALLET_CONNECTION_FAILED: 'wallet_connection_failed',
  
  // Network events
  NETWORK_MISMATCH_SHOWN: 'network_mismatch_shown',
  NETWORK_SWITCH_ATTEMPTED: 'network_switch_attempted',
  NETWORK_SWITCH_SUCCESS: 'network_switch_success',
  NETWORK_SWITCH_FAILED: 'network_switch_failed',
  
  // Session events
  SESSION_RESTORED: 'session_restored',
  SESSION_EXPIRED: 'session_expired',
  
  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_RESET: 'onboarding_reset',
} as const;

/**
 * Event properties types
 */
interface WalletConnectOpenedProps {
  provider: 'reown' | 'walletconnect';
}

interface WalletConnectedProps {
  provider: 'reown' | 'walletconnect';
  chainId: number;
  address: string;
}

interface NetworkMismatchShownProps {
  currentChainId: number;
  expectedChainId: number;
}

interface WalletConnectionFailedProps {
  provider: 'reown' | 'walletconnect';
  error: string;
  errorCode?: string;
}

type TelemetryEventProps =
  | WalletConnectOpenedProps
  | WalletConnectedProps
  | NetworkMismatchShownProps
  | WalletConnectionFailedProps
  | Record<string, unknown>;

/**
 * Telemetry Service
 * Handles event tracking and can be integrated with analytics providers
 */
class TelemetryService {
  private enabled = true;
  private debugMode = __DEV__;

  /**
   * Track an event
   */
  track(eventName: string, properties?: TelemetryEventProps): void {
    if (!this.enabled) return;

    if (this.debugMode) {
      console.log('[Telemetry]', eventName, properties);
    }

    // TODO: Integrate with analytics service (e.g., Mixpanel, Amplitude, etc.)
    // Example:
    // Analytics.track(eventName, properties);
  }

  /**
   * Track wallet connection opened
   */
  trackWalletConnectOpened(provider: 'reown' | 'walletconnect'): void {
    this.track(TELEMETRY_EVENTS.WALLET_CONNECT_OPENED, { provider });
  }

  /**
   * Track wallet connected successfully
   */
  trackWalletConnected(
    provider: 'reown' | 'walletconnect',
    chainId: number,
    address: string,
  ): void {
    this.track(TELEMETRY_EVENTS.WALLET_CONNECTED, {
      provider,
      chainId,
      // Anonymize address for privacy (only track if needed for your analytics)
      address: `${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  }

  /**
   * Track wallet disconnected
   */
  trackWalletDisconnected(): void {
    this.track(TELEMETRY_EVENTS.WALLET_DISCONNECTED);
  }

  /**
   * Track wallet connection failed
   */
  trackWalletConnectionFailed(
    provider: 'reown' | 'walletconnect',
    error: string,
    errorCode?: string,
  ): void {
    this.track(TELEMETRY_EVENTS.WALLET_CONNECTION_FAILED, {
      provider,
      error,
      errorCode,
    });
  }

  /**
   * Track network mismatch shown
   */
  trackNetworkMismatchShown(
    currentChainId: number,
    expectedChainId: number = 88888,
  ): void {
    this.track(TELEMETRY_EVENTS.NETWORK_MISMATCH_SHOWN, {
      currentChainId,
      expectedChainId,
    });
  }

  /**
   * Track network switch attempted
   */
  trackNetworkSwitchAttempted(targetChainId: number): void {
    this.track(TELEMETRY_EVENTS.NETWORK_SWITCH_ATTEMPTED, {
      targetChainId,
    });
  }

  /**
   * Track network switch success
   */
  trackNetworkSwitchSuccess(newChainId: number): void {
    this.track(TELEMETRY_EVENTS.NETWORK_SWITCH_SUCCESS, {
      newChainId,
    });
  }

  /**
   * Track network switch failed
   */
  trackNetworkSwitchFailed(error: string): void {
    this.track(TELEMETRY_EVENTS.NETWORK_SWITCH_FAILED, {
      error,
    });
  }

  /**
   * Track session restored from storage
   */
  trackSessionRestored(chainId: number): void {
    this.track(TELEMETRY_EVENTS.SESSION_RESTORED, {
      chainId,
    });
  }

  /**
   * Track session expired
   */
  trackSessionExpired(reason: string): void {
    this.track(TELEMETRY_EVENTS.SESSION_EXPIRED, {
      reason,
    });
  }

  /**
   * Enable or disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

/**
 * Singleton telemetry instance
 */
export const telemetry = new TelemetryService();

