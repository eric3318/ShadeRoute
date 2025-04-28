import { createContext, ReactNode, useState } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext<{
  requestLocation: () => Promise<[number, number] | null>;
  location: [number, number] | null;
  setLocation: (location: [number, number]) => void;
}>({
  requestLocation: async () => null,
  location: null,
  setLocation: () => {},
});

type LocationProviderProps = {
  children: ReactNode;
};

const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<[number, number] | null>(null);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const getLocation = async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        console.error('Permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];
      setLocation(newLocation);
      return newLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        requestLocation: getLocation,
        location,
        setLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext, LocationProvider };
