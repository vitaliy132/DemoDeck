import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { colors, fonts } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitle: 'THE OFFICE',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: fonts.mono, letterSpacing: 2, fontSize: 14 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'FEED',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: 'CHARTS',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'UPLOAD',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'plus.square', android: 'add_box', web: 'add_box' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person', android: 'person', web: 'person' }} tintColor={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
