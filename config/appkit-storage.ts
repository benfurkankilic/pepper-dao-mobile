import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from '@reown/appkit-react-native';

/**
 * AppKit Storage implementation using AsyncStorage
 * Conforms to the Storage interface required by AppKit
 */
export const appKitStorage: Storage = {
  /**
   * Returns all keys in storage
   */
  async getKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('AppKit Storage getKeys error:', error);
      return [];
    }
  },

  /**
   * Returns all key-value entries in storage
   */
  async getEntries<T = any>(): Promise<[string, T][]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      return entries.map(([key, value]) => [
        key,
        value ? JSON.parse(value) : undefined,
      ]) as [string, T][];
    } catch (error) {
      console.error('AppKit Storage getEntries error:', error);
      return [];
    }
  },

  /**
   * Get an item from storage for a given key
   */
  async getItem<T = any>(key: string): Promise<T | undefined> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`AppKit Storage getItem error for key ${key}:`, error);
      return undefined;
    }
  },

  /**
   * Set an item in storage for a given key
   */
  async setItem<T = any>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`AppKit Storage setItem error for key ${key}:`, error);
    }
  },

  /**
   * Remove an item from storage for a given key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AppKit Storage removeItem error for key ${key}:`, error);
    }
  },
};

/**
 * Utility function to clear all AppKit-related storage
 * Useful for cleaning up stale sessions
 */
export async function clearAppKitStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter for WalletConnect and AppKit related keys
    const wcKeys = keys.filter(
      (key) =>
        key.startsWith('wc@2:') ||
        key.startsWith('WALLETCONNECT_') ||
        key.startsWith('WC_') ||
        key.includes('walletconnect') ||
        key.includes('reown')
    );
    
    if (wcKeys.length > 0) {
      console.log(`Clearing ${wcKeys.length} AppKit storage keys`);
      await AsyncStorage.multiRemove(wcKeys);
    }
  } catch (error) {
    console.error('Failed to clear AppKit storage:', error);
  }
}

