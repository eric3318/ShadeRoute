import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';
import { Button } from 'react-native-paper';
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: '#023047',
        headerStyle: {
          backgroundColor: '#219ebc',
        },
        headerTitleStyle: {
          fontWeight: 'normal',
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: () => (
            <FontAwesome5 name="route" size={24} color="#023047" />
          ),
          tabBarLabel: 'My Routes',
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
            color: '#219ebc',
          },
          headerTitle: 'Routes',
          headerLeft: () => <Button onPress={() => router.back()}>Back</Button>,
        }}
      />
    </Tabs>
  );
}
