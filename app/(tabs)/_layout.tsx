import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button } from 'tamagui';
import { router } from 'expo-router';
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
          headerLeft: () => (
            <Button unstyled onPress={() => router.back()} color="#023047">
              Back
            </Button>
          ),
        }}
      />
    </Tabs>
  );
}
