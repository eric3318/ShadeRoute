import { Mode } from './constants';
import type { City, Route } from './types';

export async function fetchCities(): Promise<City[]> {
  return [
    { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
    { name: 'New York', coordinates: [-74.006, 40.7128] },
    { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] },
    { name: 'Chicago', coordinates: [-87.6298, 41.8781] },
    { name: 'Seattle', coordinates: [-122.3321, 47.6062] },
    { name: 'Boston', coordinates: [-71.0589, 42.3601] },
    { name: 'Miami', coordinates: [-80.1918, 25.7617] },
    { name: 'Denver', coordinates: [-104.9903, 39.7392] },
  ];
}

type InitRoutingParams = {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  mode: Mode;
  timeStamp: number;
  parameter: number;
};

type InitRoutingResponse = {
  jobId: string;
};

export async function initRouting(payload: InitRoutingParams): Promise<InitRoutingResponse | null> {
  try {
    const response = await fetch(`${import.meta.env.SERVER_BASE_URL}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }

    const data: InitRoutingResponse = await response.json();

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchRoute(jobId: string): Promise<Route | null> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.SERVER_BASE_URL}/results?jobId=${jobId}`);

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
