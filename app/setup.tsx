import { Alert, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import LocationButton from '@/components/LocationButton';
import Map from '@/components/Map';
import {
  APP_STATE,
  TripPoints,
  POINT_TYPE,
  START_POINT,
  INITIAL,
  EDITING,
  NAVIGATING,
  Route,
} from '@/lib/types';
import { useAppState } from '@/hooks/useAppState/useAppState';
import ControlPanel from '@/components/ControlPanel';
import { useOptions } from '@/hooks/useOptions/useOptions';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button } from 'tamagui';
import { router } from 'expo-router';
import NavInstructions, { Instruction } from '@/components/NavInstructions';
import * as turf from '@turf/turf';
import { useLocation } from '@/hooks/useLocation/useLocation';
import { addDocument } from '@/utils/firebaseHelpers';

const CLOSE_PROXIMITY_DISTANCE = 300;
const cityData: Record<string, [number, number]> = {
  Toronto: [-79.3871, 43.6426],
  Vancouver: [-123.13, 49.3],
};

export default function NavSetup() {
  const { state, setState } = useAppState();
  const { city, mode, parameter, date: tripTime } = useOptions();
  const [tripPoints, setTripPoints] = useState<TripPoints>({
    startPoint: null,
    endPoint: null,
  });
  const [route, setRoute] = useState<Route | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [previousRoute, setPreviousRoute] = useState<Route | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    cityData[city as string]
  );
  const [controlPanelOpen, setControlPanelOpen] = useState<boolean>(false);
  const [inPreview, setInPreview] = useState<boolean>(false);
  const { location, requestLocation } = useLocation();
  const [routeEdited, setRouteEdited] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [navInfo, setNavInfo] = useState<{
    distanceTraveled: number;
    speed: number;
    arrivalTime: number;
  } | null>(null);

  const onSaveRoute = async () => {
    const path = route?.path.map((point) => {
      return { longitude: point[0], latitude: point[1] };
    });

    const details = route?.edgeDetails.map((edge) => {
      return {
        points: edge.points,
        shadeCoverage: edge.shadeCoverage,
        distance: edge.distance,
      };
    });

    const routeData = {
      startPoint: tripPoints.startPoint,
      endPoint: tripPoints.endPoint,
      path,
      details,
      city,
      mode,
      parameter,
      tripTime: tripTime ? tripTime.toISOString() : new Date().toISOString(),
      totalDistance: route?.totalDistance,
      createdAt: new Date().toISOString(),
    };

    const success = await addDocument('routes', undefined, routeData);
    if (success) {
      Alert.alert('Route saved', 'Route saved successfully');
    }
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: async () => await onSaveRoute() },
    ]);
  };

  const getRoute = async () => {
    if (!tripPoints.startPoint || !tripPoints.endPoint) {
      throw new Error('Origin and destination points are required');
    }

    try {
      const edgeData = await fetchEdgeData({
        fromLat: tripPoints.startPoint[1],
        fromLon: tripPoints.startPoint[0],
        toLat: tripPoints.endPoint[1],
        toLon: tripPoints.endPoint[0],
      });

      const shadowData = await fetchShadowData(edgeData);
      const routeData = await fetchRouteData(shadowData);
      return routeData;
    } catch (error) {
      console.error('Error while fetching route:', error);
      throw error;
    }
  };

  const fetchEdgeData = async (params: Record<string, number>) => {
    try {
      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ROUTE_SERVER_URL}/api/edges?${queryString}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch edge data: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Edge data response is empty');
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch edge data');
    }
  };

  const fetchShadowData = async (edgeData: any) => {
    if (!edgeData) {
      throw new Error('Edge data is required for shadow calculation');
    }

    try {
      console.log(tripTime?.getTime());
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_DATA_SERVER_URL}/api/shade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bBoxes: edgeData,
            timestamp: (tripTime ?? new Date()).getTime(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch shadow data: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Shadow data response is empty');
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch shadow data');
    }
  };

  const fetchRouteData = async (shadeData: any) => {
    if (!shadeData) {
      throw new Error('Shade data is required for route calculation');
    }

    if (!tripPoints.startPoint || !tripPoints.endPoint) {
      throw new Error(
        'Origin and destination points are required for route calculation'
      );
    }

    try {
      const routeRequest = {
        fromLat: tripPoints.startPoint[1],
        fromLon: tripPoints.startPoint[0],
        toLat: tripPoints.endPoint[1],
        toLon: tripPoints.endPoint[0],
        shadeData: shadeData.shadeProfile,
        shadePref: parameter,
        mode: mode,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ROUTE_SERVER_URL}/api/route`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(routeRequest),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate route: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Route data response is empty');
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate route');
    }
  };

  const calcDistance = (from: [number, number], to: [number, number]) => {
    const fromPoint = turf.point([from[0], from[1]]);
    const toPoint = turf.point([to[0], to[1]]);
    const distance = turf.distance(fromPoint, toPoint, { units: 'meters' });
    return distance;
  };

  const isDistanceValid = async () => {
    if (tripPoints.startPoint && tripPoints.endPoint) {
      const currentLocation = await requestLocation();
      const distance = calcDistance(
        currentLocation as [number, number],
        tripPoints.startPoint
      );
      return distance <= CLOSE_PROXIMITY_DISTANCE;
    }
  };

  const startNavigation = async () => {
    const isValid = await isDistanceValid();
    if (isValid) {
      setInPreview(false);
      setState(NAVIGATING);
    } else {
      showAlert('You seem far away...', 'Save route for later?');
    }
  };

  const onBackButtonClick = () => {
    setInPreview(false);
    setState(EDITING);
  };

  const onGoButtonClick = async () => {
    await startNavigation();
  };

  const onConfirmButtonClick = async () => {
    switch (state) {
      case INITIAL:
        try {
          const routeData = await getRoute();
          setRoute(routeData);
          setInstructions(routeData.instructions);
          setRouteEdited(true);
        } catch (error) {
          console.error(
            'Failed to get route:',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        break;
      case EDITING:
        await startNavigation();
    }
  };

  const onEndTripButtonClick = () => {
    setTripPoints({
      startPoint: null,
      endPoint: null,
    });
    setRoute(null);
    setPreviousRoute(null);
    changeAppState(INITIAL);
  };

  const changeAppState = (newState: APP_STATE) => {
    setState(newState);
  };

  useEffect(() => {
    if (state === EDITING) {
      const getNewRoute = async () => {
        const newRouteData = await getRoute();
        if (newRouteData) {
          setRoute(newRouteData);
          setInstructions(newRouteData.instructions);
          setPreviousRoute(null);
          setRouteEdited(true);
        }
      };
      getNewRoute();
    }
  }, [tripPoints, state, parameter, tripTime, mode]);

  useEffect(() => {
    if (routeEdited) {
      setInPreview(true);
    }
  }, [routeEdited]);

  const onPointChange = (newPoint: [number, number], pointType: POINT_TYPE) => {
    setTripPoints((prev) => ({
      ...prev,
      [pointType === START_POINT ? 'startPoint' : 'endPoint']: newPoint,
    }));
  };

  useEffect(() => {
    if (
      (state === INITIAL && tripPoints.startPoint && tripPoints.endPoint) ||
      state === EDITING ||
      state === NAVIGATING
    ) {
      setControlPanelOpen(true);
    } else {
      setControlPanelOpen(false);
    }
  }, [state, tripPoints.startPoint, tripPoints.endPoint]);

  const onInfoChange = (
    distanceTraveled: number,
    speed: number,
    arrivalTime: number
  ) => {
    setNavInfo({ distanceTraveled, speed, arrivalTime });
  };

  return (
    <View style={styles.container}>
      {state === INITIAL && !inPreview && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>
            {!tripPoints.startPoint
              ? 'Tap to select origin'
              : !tripPoints.endPoint
                ? 'Tap to select destination'
                : 'Adjust routing behavior'}
          </Text>
        </View>
      )}

      {state === EDITING && !inPreview && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Drag points or change settings</Text>
        </View>
      )}

      <View style={styles.locationButtonContainer}>
        <LocationButton setMapCenter={setMapCenter} />
        <Button
          onPress={() => router.push('/')}
          icon={<FontAwesome5 name="home" size={24} />}
          style={{
            padding: 8,
          }}
        />
      </View>

      <View style={styles.controlPanelContainer}>
        <ControlPanel
          open={controlPanelOpen}
          onStartTrip={onGoButtonClick}
          onEndTrip={onEndTripButtonClick}
          onEdit={onBackButtonClick}
          onConfirmSettings={onConfirmButtonClick}
          inPreview={inPreview}
          navInfo={navInfo ?? undefined}
        />
      </View>

      {state === NAVIGATING && route && instructions && (
        <View
          style={{
            position: 'absolute',
            top: '12%',
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: '#219EBC',
            borderRadius: 16,
          }}
        >
          <NavInstructions
            instructions={instructions}
            totalDistance={route.totalDistance}
            onInfoChange={onInfoChange}
          />
        </View>
      )}

      <Map
        route={route ?? undefined}
        center={mapCenter}
        points={tripPoints}
        onPointChange={onPointChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationButtonContainer: {
    rowGap: 10,
    position: 'absolute',
    bottom: '28%',
    left: 0,
    zIndex: 1,
  },
  promptContainer: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    marginHorizontal: 18,
    paddingVertical: 24,
    backgroundColor: '#219EBC',
    borderRadius: 16,
    zIndex: 1,
  },
  promptText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  controlPanelContainer: {
    position: 'absolute',
    bottom: '5%',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  previewControlButtonContainer: {
    position: 'absolute',
    bottom: '5%',
    left: 0,
    right: 0,
    zIndex: 1,
    marginVertical: 24,
    marginHorizontal: 12,
    rowGap: 12,
  },
  previewControlButton: {
    backgroundColor: '#FF6403',
  },
});
