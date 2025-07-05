import MapboxGL from '@rnmapbox/maps';
import React from 'react';
import { Route } from '@/lib/types';
import { getRouteGeoJson } from '@/utils/helpers';

type RouteDisplayProps = {
  route: Route;
};

export default function RouteDisplay({ route }: RouteDisplayProps) {
  const routeGeoJson = getRouteGeoJson(route);

  // useEffect(() => {
  //   try {
  //     const { details, path } = route;
  //
  //     const edgesWithCoverage = details.map((edge, index, array) => {
  //       const coordinates: [number, number][] = [];
  //       for (let i = 0; i < edge.points.length; i += 2) {
  //         coordinates.push([edge.points[i], edge.points[i + 1]] as [
  //           number,
  //           number,
  //         ]);
  //       }
  //
  //       const n = coordinates.length;
  //
  //       if (index === 0) {
  //         return {
  //           coordinates: path.slice(0, n),
  //           coverage: edge.coverage,
  //         };
  //       }
  //
  //       if (index === array.length - 1) {
  //         return {
  //           coordinates: path.slice(-n),
  //           coverage: edge.coverage,
  //         };
  //       }
  //
  //       return {
  //         coordinates,
  //         coverage: edge.coverage,
  //       };
  //     });
  //
  //     setRouteCoordinates(edgesWithCoverage);
  //   } catch (error) {
  //     console.error('Error processing route:', error);
  //   }
  // }, [route]);

  return (
    <>
      <MapboxGL.ShapeSource id="route-source" shape={routeGeoJson}>
        <MapboxGL.LineLayer
          id="route-line"
          style={{
            lineColor: [
              'case',
              ['>', ['get', 'coverage'], 0.6666],
              '#2ecc71',
              ['>', ['get', 'coverage'], 0.3333],
              '#f1c40f',
              '#e74c3c',
            ],
            lineWidth: 6,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </MapboxGL.ShapeSource>
    </>
  );
}
