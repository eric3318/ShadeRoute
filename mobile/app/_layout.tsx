import { ContextProvider } from '@/hooks/ContextProvider';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import RootNavigator from '@/components/RootNavigator';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ee6352',
    onPrimary: 'white',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ContextProvider>
        <StatusBar style="light" backgroundColor="black" />
        <RootNavigator />
      </ContextProvider>
    </PaperProvider>
  );
}
