import {
  InitRoutingParams,
  InitRoutingResponse,
  Route,
  RouteToResume,
  SavedRoute,
} from '@/lib/types';
import { Platform } from 'react-native';
import {
  LocationObject,
  getCurrentPositionAsync,
  LocationAccuracy,
} from 'expo-location';

export async function initRouting(
  payload: InitRoutingParams
): Promise<InitRoutingResponse | null> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/route`,
      // 'https://api.shadepath.com/api/route',
      // 'http://localhost:8080/api/route',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error('Unsuccessful response from server');
    }

    const data: InitRoutingResponse = await response.json();

    return data;
  } catch (error) {
    console.error('Error while fetching route:', error);
    return null;
  }
}

export async function pollResult(jobId: string): Promise<Route | null> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/api/results?jobId=${jobId}`
          // `https://api.shadepath.com/api/results?jobId=${jobId}`
          // `http://localhost:8080/api/results?jobId=${jobId}`
        );

        if (!response.ok) {
          throw new Error('Unsuccessful response from server');
        }

        if (response.status === 204) {
          return;
        }

        const data = await response.json();
        clearInterval(interval);
        resolve(data);
      } catch (err) {
        console.error('Error while polling route results:', err);
        clearInterval(interval);
        resolve(null);
      }
    }, 1000);
  });
}

export function getRouteGeoJson(route: Route): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: route.details.map((detail) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: detail.points },
      properties: {
        coverage: detail.coverage,
      },
    })),
  };
}

export function toRoute(savedRoute: SavedRoute): RouteToResume {
  const {
    path,
    details,
    distance,
    weightedAverageCoverage,
    start,
    end,
    instructions,
  } = savedRoute;

  return {
    start,
    end,
    path: path.map((p) => [p.longitude, p.latitude]),
    details: details.map((d) => ({
      ...d,
      points: d.points.map((p) => [p.longitude, p.latitude]),
    })),
    distance,
    weightedAverageCoverage,
    instructions,
  };
}

function delay(timeInMilliseconds: number) {
  return new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeInMilliseconds);
  });
}

export async function getCurrentLocationOnce() {
  const ANDROID_DELAY_IN_MS = 4 * 1000;
  const IOS_DELAY_IN_MS = 15 * 1000;

  const DELAY_IN_MS =
    Platform.OS === 'ios' ? IOS_DELAY_IN_MS : ANDROID_DELAY_IN_MS;

  const MAX_TRIES = 3;
  let tries = 1;

  let location: LocationObject | null = null;

  let locationError: Error | null = null;

  do {
    try {
      location = await Promise.race([
        delay(DELAY_IN_MS),
        getCurrentPositionAsync({
          accuracy: LocationAccuracy.BestForNavigation,
          distanceInterval: 0,
          timeInterval: 0,
        }),
      ]);

      if (!location) {
        throw new Error('Timeout');
      }
    } catch (err) {
      locationError = err as Error;
    } finally {
      tries += 1;
    }
  } while (!location && tries <= MAX_TRIES);

  if (!location) {
    const error = locationError ?? new Error('💣');

    throw error;
  }

  return location;
}
