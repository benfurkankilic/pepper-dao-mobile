# Wallet Connection Setup

This app uses [Reown AppKit](https://docs.reown.com) for wallet connection functionality.

## Setup Instructions

### 1. Get Your Reown Project ID

1. Visit [Reown Dashboard](https://cloud.reown.com)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Reown AppKit Configuration
EXPO_PUBLIC_REOWN_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

Replace `YOUR_PROJECT_ID_HERE` with your actual Project ID from step 1.

> **Note**: The `.env` file is gitignored for security. Never commit your Project ID to version control.

### 3. Install Dependencies

If you haven't already, install the dependencies:

```bash
npm install
```

### 4. Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Features

- **Dismissible Onboarding Modal**: First-time users see a welcome modal with options to connect or explore
- **Read-Only Mode**: Users can browse proposals and treasury without connecting
- **Chain Guard**: Transactions are restricted to Chiliz Chain (chainId: 88888)
- **Session Persistence**: Wallet connections persist across app restarts
- **Network Mismatch Detection**: Clear warnings when connected to wrong network

## Implementation Details

### Key Files

- `config/appkit.ts` - AppKit initialization
- `config/appkit-storage.ts` - AsyncStorage adapter
- `components/onboarding/wallet-connection-modal.tsx` - Connection modal UI
- `contexts/wallet-context.tsx` - Wallet state management
- `hooks/use-protected-action.ts` - Transaction guard enforcement

### Supported Networks

Currently, the app only supports:
- **Chiliz Chain** (chainId: 88888)
- RPC: `https://rpc.ankr.com/chiliz`
- Explorer: `https://explorer.chiliz.com`

### Telemetry Events

The app tracks the following wallet events:
- `wallet_connect_opened` - When user opens connection modal
- `wallet_connected` - When wallet successfully connects
- `network_mismatch_shown` - When user connects to wrong network
- `wallet_disconnected` - When user disconnects wallet

## Troubleshooting

### Modal doesn't open on Android

If the AppKit modal doesn't open on Android with Expo Router, the app includes a workaround with absolute positioning. This is handled automatically in `app/_layout.tsx`.

### Connection fails

1. Ensure your Project ID is correctly set in `.env`
2. Check that you're using a compatible wallet app
3. Verify your device has internet connectivity
4. Try restarting the app

### Wrong network warning persists

Make sure to switch to Chiliz Chain (chainId: 88888) in your wallet app. The app cannot programmatically switch networks for security reasons.

## Resources

- [Reown AppKit Documentation](https://docs.reown.com/appkit/react-native/core/installation)
- [Chiliz Chain Documentation](https://docs.chiliz.com)
- [Feature Specification](./documentations/features/wallet-and-onboarding.md)

