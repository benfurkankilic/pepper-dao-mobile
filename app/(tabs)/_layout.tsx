import React from 'react';
import { Platform } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={Colors.light.primary}
      labelStyle={{ color: Colors.light.text }}>
      <NativeTabs.Trigger name="index">
        {Platform.select({
          ios: <Icon sf={{ default: 'house', selected: 'house.fill' }} />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />,
          default: <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />,
        })}
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wallet">
        {Platform.select({
          ios: <Icon sf={{ default: 'creditcard', selected: 'creditcard.fill' }} />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="account-balance-wallet" />} />
          ),
          default: (
            <Icon src={<VectorIcon family={MaterialIcons} name="account-balance-wallet" />} />
          ),
        })}
        <Label>Wallet</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        {Platform.select({
          ios: <Icon sf={{ default: 'paperplane', selected: 'paperplane.fill' }} />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="send" />} />,
          default: <Icon src={<VectorIcon family={MaterialIcons} name="send" />} />,
        })}
        <Label>Explore</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
