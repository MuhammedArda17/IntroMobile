import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🏠</Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Veld Boeken',
          tabBarLabel: 'Boeken',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>📅</Text>
          ),
          href: user ? undefined : null
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarLabel: ' Ranking',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🏆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiel',
          tabBarLabel: 'Profiel',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}