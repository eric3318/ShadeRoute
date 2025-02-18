import { APP_STATE, INITIAL, Route } from '@/lib/types';
import { createContext, ReactNode, useState } from 'react';

type AppStates = {
  state: APP_STATE;
  setState: (state: APP_STATE) => void;
};

const AppStateContext = createContext<AppStates>({
  state: INITIAL,
  setState: () => null,
});

type AppStateProviderProps = {
  children: ReactNode;
};

const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [state, setState] = useState<APP_STATE>(INITIAL);

  return (
    <AppStateContext.Provider
      value={{
        state,
        setState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateProvider, AppStateContext };
