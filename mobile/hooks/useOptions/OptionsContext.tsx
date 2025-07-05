import { getDocuments } from '@/utils/firebaseHelpers';
import { createContext, ReactNode, useState, useEffect } from 'react';
import { City, Mode } from '@/lib/types';

type Options = {
  city: City | null;
  cityOptions: City[];
  mode: Mode;
  date: Date | null;
  parameter: number;
  setCity: (city: City) => void;
  setMode: (mode: Mode) => void;
  setDate: (date: Date | null) => void;
  setParameter: (parameter: number) => void;
};

const OptionsContext = createContext<Options>({
  city: null,
  cityOptions: [],
  mode: Mode.RUNNING,
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
  const [city, setCity] = useState<City | null>(null);
  const [cityOptions, setCityOptions] = useState<City[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.RUNNING);
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
        coordinates: doc.coordinates,
      }));

      setCityOptions(cityOptions);
      setCity(cityOptions[0]);
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
