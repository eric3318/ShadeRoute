import { APP_STATE, INITIAL, Route } from '@/lib/types';
import { createContext, ReactNode, useState } from 'react';

type AppStates = {
  city: string;
  setCity: (city: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  state: APP_STATE;
  setState: (state: APP_STATE) => void;
};

const AppStateContext = createContext<AppStates>({
  city: 'Vancouver',
  setCity: () => null,
  mode: 'running',
  setMode: () => null,
  state: INITIAL,
  setState: () => null,
});

type AppStateProviderProps = {
  children: ReactNode;
};

const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [city, setCity] = useState<string>('Vancouver');
  const [mode, setMode] = useState<string>('running');
  const [state, setState] = useState<APP_STATE>(INITIAL);

  return (
    <AppStateContext.Provider
      value={{
        city,
        setCity,
        mode,
        setMode,
        state,
        setState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateProvider, AppStateContext };
