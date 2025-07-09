import { Stack, useRouter } from 'expo-router';

export default function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
