import { Stack } from 'expo-router';
import { ContextProvider } from '@/hooks/ContextProvider';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <ContextProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" />
        </Stack>
      </ContextProvider>
    </PaperProvider>
  );
}
