import { Redirect, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Text } from 'react-native';

export default function Layout() {
  const { user } = useAuth();

  if (user === undefined) {
    return <Text>Loading...</Text>;
  }

  if (user === null) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="routes-saved"
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="folder" size={24} color="#3fa7d6" />
          ),
          tabBarLabel: 'saved routes',
          tabBarLabelStyle: {
            fontSize: 12,
            color: '#3fa7d6',
          },
          headerTitle: 'Routes',
          headerLeft: () => (
            <IconButton icon="arrow-left" onPress={() => router.back()} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: () => <AntDesign name="user" size={24} color="#3fa7d6" />,
          tabBarLabel: 'profile',
          tabBarLabelStyle: {
            fontSize: 12,
            color: '#3fa7d6',
          },
          headerTitle: 'My Profile',
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => router.dismissTo('/')}
            />
          ),
        }}
      />
    </Tabs>
  );
}
