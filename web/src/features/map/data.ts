import { Mode } from './constants';
import type { Route } from './types';

export async function fetchCities() {}

type FetchRouteParams = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  mode: Mode;
  dateTime: string;
  shade: number;
};

export async function fetchRoute({ start, end, mode, dateTime, shade }: FetchRouteParams): Promise<Route | null> {
  try {
    const response = await fetch(`${import.meta.env.SERVER_BASE_URL}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }

    const data: Route = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
