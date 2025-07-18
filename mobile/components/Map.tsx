import MapboxGL from '@rnmapbox/maps';
import { View, StyleSheet, Text } from 'react-native';
import { useLocation } from '@/hooks/useLocation/useLocation';
import {
  POINT_TYPE,
  START_POINT,
  END_POINT,
  TripPoints,
  Route,
  APP_STATE,
} from '@/lib/types';
import { useAppState } from '@/hooks/useAppState/useAppState';
import RouteDisplay from './RouteDisplay';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';

type MapProps = {
  route: Route | null;
  center: [number, number] | undefined;
  points: TripPoints;
  heading: number;
  onPointChange: (newPoint: [number, number], pointType: POINT_TYPE) => void;
};

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function Map({
  center,
  points,
  route,
  heading,
  onPointChange,
}: MapProps) {
  const { location } = useLocation();
  const { state } = useAppState();
  const [bounds, setBounds] = useState<{
    ne: [number, number];
    sw: [number, number];
  } | null>(null);

  useEffect(() => {
    if (state === APP_STATE.NAVIGATING) {
      setBounds(null);
    } else if (route?.path) {
      const lngs = route.path.map((coord) => coord[0]);
      const lats = route.path.map((coord) => coord[1]);

      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

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
    onPointChange(coordinates, pointType);
  };

  const onDragEnd = (event: any, pointType: POINT_TYPE) => {
    onPointChange(event.geometry.coordinates, pointType);
  };

  return (
    <MapboxGL.MapView
      style={styles.map}
      onPress={onMapPress}
      compassEnabled={true}
    >
      <MapboxGL.Camera
        zoomLevel={bounds ? undefined : 15}
        animationMode={bounds ? 'flyTo' : 'moveTo'}
        centerCoordinate={
          state === APP_STATE.NAVIGATING && location
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
          draggable={state === APP_STATE.EDITING}
          onDragEnd={(e) => onDragEnd(e, START_POINT)}
        >
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: '#ee6352',
              borderRadius: 15,
            }}
          />
        </MapboxGL.PointAnnotation>
      )}

      {points.endPoint && (
        <MapboxGL.PointAnnotation
          id="endPoint"
          coordinate={points.endPoint}
          draggable={state === APP_STATE.EDITING}
          onDragEnd={(e) => onDragEnd(e, END_POINT)}
        >
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: '#59cd90',
              borderRadius: 15,
            }}
          />
        </MapboxGL.PointAnnotation>
      )}

      {location && (
        <MapboxGL.MarkerView id="currentLocation" coordinate={location}>
          <View
            style={{
              transform: [{ rotate: `${heading}deg` }],
              alignItems: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/location.png')}
              style={{
                width: 52,
                height: 52,
              }}
            />
          </View>
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
