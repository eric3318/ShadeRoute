import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth/useAuth';

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="nav" />
      </Stack.Protected>
    </Stack>
  );
}
