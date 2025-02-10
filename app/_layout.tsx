import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import { createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';
import { ContextProvider } from '@/hooks/ContextProvider';

const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <ContextProvider>
        <Stack
          screenOptions={{
            // headerStyle: {
            //   backgroundColor: '#f4511e',
            // },
            // headerTintColor: '#fff',
            // headerTitleStyle: {
            //   fontWeight: 'bold',
            // },
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" />
        </Stack>
      </ContextProvider>
    </TamaguiProvider>
  );
}
