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

      <NativeTabs.Trigger name="governance">
        {Platform.select({
          ios: <Icon sf={{ default: 'checkmark.seal', selected: 'checkmark.seal.fill' }} />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="gavel" />} />,
          default: <Icon src={<VectorIcon family={MaterialIcons} name="gavel" />} />,
        })}
        <Label>Governance</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="power">
        {Platform.select({
          ios: <Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />,
          default: <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />,
        })}
        <Label>Power</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
