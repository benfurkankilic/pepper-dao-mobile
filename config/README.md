# Configuration Setup

## WalletConnect Project ID

To enable wallet connections, you need a WalletConnect Project ID:

### Steps to Get Your Project ID:

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in with your account
3. Click "Create New Project"
4. Fill in your project details:
   - **Name**: Pepper DAO
   - **Description**: Pepper DAO Mobile App
   - **URL**: https://pepperprotocol.io
5. Copy the **Project ID** from your project dashboard

### Configure the Project ID:

#### Option 1: Environment Variable (Recommended for production)
Create a `.env` file in the project root:
```bash
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### Option 2: Direct Configuration (For development only)
Edit `config/wallet-connect.ts` and replace `YOUR_PROJECT_ID_HERE` with your actual Project ID.

⚠️ **Security Note**: Never commit your Project ID to version control if using Option 2.

## Chiliz Chain Configuration

The Chiliz chain (chainId: 88888) is pre-configured in `config/chains.ts` with public RPC endpoints. No additional configuration is needed for basic functionality.

## Storage Configuration

MMKV storage is configured in `lib/storage.ts` with encryption enabled. No additional setup required.

