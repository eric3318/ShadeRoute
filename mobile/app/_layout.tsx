import { ContextProvider } from '@/hooks/ContextProvider';
import { PaperProvider } from 'react-native-paper';
import RootNavigator from '@/components/RootNavigator';

export default function RootLayout() {
  return (
    <PaperProvider>
      <ContextProvider>
        <RootNavigator />
      </ContextProvider>
    </PaperProvider>
  );
}
