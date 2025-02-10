import { ReactNode } from 'react';
import { LocationProvider } from './useLocation/locationContext';
import { OptionsProvider } from './useOptions/OptionsContext';
import { AppStateProvider } from './useAppState/appStateContext';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <OptionsProvider>
      <AppStateProvider>
        <LocationProvider>{children}</LocationProvider>
      </AppStateProvider>
    </OptionsProvider>
  );
};

export { ContextProvider };
