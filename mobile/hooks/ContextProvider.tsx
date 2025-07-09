import { ReactNode } from 'react';
import { LocationProvider } from './useLocation/locationContext';
import { OptionsProvider } from './useOptions/OptionsContext';
import { AppStateProvider } from './useAppState/appStateContext';
import { RouteContextProvider } from './useRoute/RouteContextProvider';
import AuthProvider from './useAuth/AuthProvider';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <OptionsProvider>
        <AppStateProvider>
          <RouteContextProvider>
            <LocationProvider>{children}</LocationProvider>
          </RouteContextProvider>
        </AppStateProvider>
      </OptionsProvider>
    </AuthProvider>
  );
};

export { ContextProvider };
