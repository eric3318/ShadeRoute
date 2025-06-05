import type { Route } from './types';

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
