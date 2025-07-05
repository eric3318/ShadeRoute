import { ReactNode } from 'react';
import { LocationProvider } from './useLocation/locationContext';
import { OptionsProvider } from './useOptions/OptionsContext';
import { AppStateProvider } from './useAppState/appStateContext';
import AuthProvider from './useAuth/AuthProvider';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <OptionsProvider>
        <AppStateProvider>
          <LocationProvider>{children}</LocationProvider>
        </AppStateProvider>
      </OptionsProvider>
    </AuthProvider>
  );
};

export { ContextProvider };
