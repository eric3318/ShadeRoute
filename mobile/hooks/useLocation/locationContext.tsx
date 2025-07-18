import { createContext, ReactNode, useState } from 'react';
import {
  getCurrentPositionAsync,
  LocationAccuracy,
  useForegroundPermissions,
} from 'expo-location';
import { Platform } from 'react-native';

const LocationContext = createContext<{
  requestLocation: () => Promise<[number, number] | null>;
  requestLocationPermission: () => Promise<boolean>;
  location: [number, number] | null;
  setLocation: (location: [number, number]) => void;
}>({
  requestLocation: async () => null,
  requestLocationPermission: async () => false,
  location: null,
  setLocation: () => {},
});

type LocationProviderProps = {
  children: ReactNode;
};

const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [permissionStatus, requestPermission] = useForegroundPermissions();

  const requestLocationPermission = async (): Promise<boolean> => {
    if (permissionStatus && permissionStatus.granted) {
      return true;
    }

    const { status } = await requestPermission();
    return status === 'granted';
  };

  const getLocation = async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Permission not granted by user');
      }

      const location = await getCurrentPositionAsync({
        accuracy:
          Platform.OS === 'android'
            ? LocationAccuracy.Low
            : LocationAccuracy.Lowest,
      });

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
        requestLocationPermission,
        location,
        setLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext, LocationProvider };
