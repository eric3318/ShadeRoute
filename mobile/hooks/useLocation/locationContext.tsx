import { createContext, ReactNode, useState } from 'react';
import {
  getCurrentPositionAsync,
  getLastKnownPositionAsync,
  LocationAccuracy,
  useForegroundPermissions,
  LocationObject,
} from 'expo-location';
import { Platform } from 'react-native';
import { getCurrentLocationOnce } from '@/utils/helpers';

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

  const requestLocation = async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Permission not granted by user');
      }

      const lastknownlocation = await getLastKnownPositionAsync({
        maxAge: 15000,
      });

      let locationObject: LocationObject =
        lastknownlocation ?? (await getCurrentLocationOnce());

      const newLocation: [number, number] = [
        locationObject.coords.longitude,
        locationObject.coords.latitude,
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
        requestLocation,
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
