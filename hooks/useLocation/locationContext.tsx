import { createContext, ReactNode, useState } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext<{
  requestLocation: (() => Promise<[number, number] | null>) | null;
  location: [number, number] | null;
  subscribeToLocationUpdates:
    | (() => Promise<Location.LocationSubscription>)
    | null;
}>({ requestLocation: null, location: null, subscribeToLocationUpdates: null });

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

  const subscribeToLocationUpdates = async () => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
      },
      (location) =>
        setLocation([location.coords.longitude, location.coords.latitude])
    );
    return subscription;
  };

  return (
    <LocationContext.Provider
      value={{
        requestLocation: getLocation,
        location,
        subscribeToLocationUpdates,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext, LocationProvider };
