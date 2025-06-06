import { Mode } from './constants';
import type { Route } from './types';

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
    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/route`, {
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
        const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/results?jobId=${jobId}`);

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
