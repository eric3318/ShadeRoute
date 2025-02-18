import MapboxGL from '@rnmapbox/maps';
import { useEffect, useState } from 'react';
import React from 'react';
import { Route } from '@/lib/types';

interface RouteDisplayProps {
  route: Route;
}

export default function RouteDisplay({ route }: RouteDisplayProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{
      coordinates: [number, number][];
      coverage: number;
    }>
  >([]);

  useEffect(() => {
    try {
      const { edgeDetails, path } = route;

      const edgesWithCoverage = edgeDetails.map((edge, index, array) => {
        const coordinates: [number, number][] = [];
        for (let i = 0; i < edge.points.length; i += 2) {
          coordinates.push([edge.points[i], edge.points[i + 1]] as [
            number,
            number,
          ]);
        }

        const n = coordinates.length;

        if (index === 0) {
          return {
            coordinates: path.slice(0, n),
            coverage: edge.shadeCoverage,
          };
        }

        if (index === array.length - 1) {
          return {
            coordinates: path.slice(-n),
            coverage: edge.shadeCoverage,
          };
        }

        return {
          coordinates,
          coverage: edge.shadeCoverage,
        };
      });

      setRouteCoordinates(edgesWithCoverage);
    } catch (error) {
      console.error('Error processing route:', error);
    }
  }, [route]);

  return (
    <>
      {routeCoordinates.map((segment, index) => (
        <MapboxGL.ShapeSource
          key={`line-${index}`}
          id={`line-${index}`}
          shape={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: segment.coordinates,
            },
          }}
        >
          <MapboxGL.LineLayer
            id={`line-layer-${index}`}
            style={{
              lineColor:
                segment.coverage > 0.3333
                  ? '#2ecc71'
                  : segment.coverage > 0.6666
                    ? '#f1c40f'
                    : '#e74c3c',
              lineWidth: 6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapboxGL.ShapeSource>
      ))}
    </>
  );
}
