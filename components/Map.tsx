import MapboxGL from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { useLocation } from '@/hooks/useLocation/useLocation';
import {
  POINT_TYPE,
  EDITING,
  START_POINT,
  END_POINT,
  TripPoints,
  Route,
  NAVIGATING,
} from '@/lib/types';
import { useAppState } from '@/hooks/useAppState/useAppState';
import RouteDisplay from './RouteDisplay';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';

interface MapProps {
  route?: Route;
  center: [number, number] | undefined;
  points: TripPoints;
  onPointChange: (
    newPoint: [number, number],
    pointType: POINT_TYPE,
    eventType: 'press' | 'drag'
  ) => void;
}

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function Map({
  center,
  points,
  route,
  onPointChange,
}: MapProps) {
  const { location, subscribeToLocationUpdates } = useLocation();
  const { state } = useAppState();
  const [bounds, setBounds] = useState<{
    ne: [number, number];
    sw: [number, number];
  } | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  // Handle location subscription during navigation
  useEffect(() => {
    const setupLocationTracking = async () => {
      if (state === NAVIGATING && subscribeToLocationUpdates) {
        try {
          // Subscribe to location updates
          const subscription = await subscribeToLocationUpdates();
          locationSubscription.current = subscription;
        } catch (error) {
          console.error('Error setting up location tracking:', error);
        }
      }
    };

    setupLocationTracking();

    // Cleanup subscription when navigation ends or component unmounts
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [state, subscribeToLocationUpdates]);

  // Handle bounds and map centering
  useEffect(() => {
    if (state === NAVIGATING) {
      // During navigation, don't use bounds
      setBounds(null);
    } else if (route?.path) {
      // Calculate bounds of the route when not navigating
      const lngs = route.path.map((coord) => coord[0]);
      const lats = route.path.map((coord) => coord[1]);

      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      // Add some padding to the bounds
      const lngPadding = (maxLng - minLng) * 0.4;
      const latPadding = (maxLat - minLat) * 0.4;

      setBounds({
        ne: [maxLng + lngPadding, maxLat + latPadding],
        sw: [minLng - lngPadding, minLat - latPadding],
      });
    } else {
      setBounds(null);
    }
  }, [route, state]);

  const onMapPress = (event: any) => {
    if (points.startPoint && points.endPoint) {
      return;
    }
    const coordinates = event.geometry.coordinates;
    const pointType = points.startPoint ? END_POINT : START_POINT;
    onPointChange(coordinates, pointType, 'press');
  };

  const onDragEnd = (event: any, pointType: POINT_TYPE) => {
    onPointChange(event.geometry.coordinates, pointType, 'drag');
  };

  return (
    <MapboxGL.MapView style={styles.map} onPress={onMapPress}>
      <MapboxGL.Camera
        zoomLevel={bounds ? undefined : 15}
        animationMode={bounds ? 'flyTo' : 'moveTo'}
        centerCoordinate={
          state === NAVIGATING && location
            ? location
            : bounds
              ? undefined
              : center
        }
        bounds={bounds || undefined}
        maxZoomLevel={18}
        animationDuration={1000}
      />
      {route && <RouteDisplay route={route} />}

      {points.startPoint && (
        <MapboxGL.PointAnnotation
          id="startPoint"
          coordinate={points.startPoint}
          draggable={state === EDITING}
          onDragEnd={(e) => onDragEnd(e, START_POINT)}
          style={{ position: 'relative' }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'green',
              borderRadius: 15,
            }}
          />
        </MapboxGL.PointAnnotation>
      )}
      {points.endPoint && (
        <MapboxGL.PointAnnotation
          id="endPoint"
          coordinate={points.endPoint}
          draggable={state === EDITING}
          onDragEnd={(e) => onDragEnd(e, END_POINT)}
        >
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'orange',
              borderRadius: 15,
            }}
          />
        </MapboxGL.PointAnnotation>
      )}
      {location && (
        <MapboxGL.MarkerView id="currentLocation" coordinate={location}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: 'blue',
              borderRadius: 10,
            }}
          />
        </MapboxGL.MarkerView>
      )}
    </MapboxGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
