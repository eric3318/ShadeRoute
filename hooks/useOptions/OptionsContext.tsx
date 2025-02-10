import { createContext, ReactNode, useState } from 'react';

type Options = {
  city: string;
  mode: string;
  date: Date | null;
  parameter: number;
  setCity: (city: string) => void;
  setMode: (mode: string) => void;
  setDate: (date: Date | null) => void;
  setParameter: (parameter: number) => void;
};
const OptionsContext = createContext<Options>({
  city: 'Vancouver',
  mode: 'running',
  date: null,
  parameter: 0,
  setCity: () => {},
  setMode: () => {},
  setDate: () => {},
  setParameter: () => {},
});

type OptionsProviderProps = {
  children: ReactNode;
};

const OptionsProvider = ({ children }: OptionsProviderProps) => {
  const [city, setCity] = useState<string>('Vancouver');
  const [mode, setMode] = useState<string>('running');
  const [date, setDate] = useState<Date | null>(null);
  const [parameter, setParameter] = useState<number>(0);

  return (
    <OptionsContext.Provider
      value={{
        city,
        mode,
        date,
        parameter,
        setCity,
        setMode,
        setDate,
        setParameter,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export { OptionsProvider, OptionsContext };
