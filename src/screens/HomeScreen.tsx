import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { HomeTabParamList } from '../navigation/types';
import { SinglePhoneScreen } from './SinglePhoneScreen';
import { MultiPhoneScreen } from './MultiPhoneScreen';
import { colors, fonts } from '../theme/theme';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
          tabBarStyle: { backgroundColor: colors.bg, elevation: 0, shadowOpacity: 0 },
          tabBarLabelStyle: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 0.5, textTransform: 'none' },
          tabBarPressColor: colors.surface,
        }}
      >
        <Tab.Screen name="SinglePhone" component={SinglePhoneScreen} options={{ title: 'Single Phone' }} />
        <Tab.Screen name="MultiPhone" component={MultiPhoneScreen} options={{ title: 'Multi Phone' }} />
      </Tab.Navigator>
    </View>
  );
}
