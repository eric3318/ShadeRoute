import { getDocuments } from '@/utils/firebaseHelpers';
import { createContext, ReactNode, useState, useEffect } from 'react';

type Options = {
  city: string;
  cityOptions: { name: string; center: [number, number] }[];
  mode: string;
  date: Date | null;
  parameter: number;
  setCity: (city: string) => void;
  setMode: (mode: string) => void;
  setDate: (date: Date | null) => void;
  setParameter: (parameter: number) => void;
};
const OptionsContext = createContext<Options>({
  city: '',
  cityOptions: [],
  mode: '',
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
  const [city, setCity] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<
    { name: string; center: [number, number] }[]
  >([]);
  const [mode, setMode] = useState<string>('running');
  const [date, setDate] = useState<Date | null>(null);
  const [parameter, setParameter] = useState<number>(0);

  useEffect(() => {
    async function fetchCityOptions() {
      const cityDocs = await getDocuments('cities');
      if (!cityDocs) {
        return;
      }
      const cityOptions = cityDocs.map((doc) => ({
        name: doc.name,
        center: doc.center,
      }));
      setCityOptions(cityOptions);
      setCity(cityOptions[0].name);
    }
    fetchCityOptions();
  }, []);

  return (
    <OptionsContext.Provider
      value={{
        city,
        cityOptions,
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
