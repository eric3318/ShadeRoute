import { StyleSheet, Text, View } from 'react-native';
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
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Button } from 'tamagui';
import { router } from 'expo-router';
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
  const [previousRoute, setPreviousRoute] = useState<Route | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    cityData[city as string]
  );
  const [controlPanelOpen, setControlPanelOpen] = useState<boolean>(false);
  const [inZoom, setInZoom] = useState<boolean>(false);

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
      console.log('route data', data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate route');
    }
  };

  const onGoButtonClick = async () => {
    switch (state) {
      case INITIAL:
        setInZoom(false);
        setState(NAVIGATING);
        break;
      case EDITING:
        try {
          setPreviousRoute(null);
          setInZoom(false);
          setState(NAVIGATING);
        } catch (error) {
          console.error('Error updating route:', error);
        }
        break;
    }
  };

  const onBackButtonClick = () => {
    setInZoom(false);
    setState(EDITING);
  };

  const onConfirmButtonClick = async () => {
    switch (state) {
      case INITIAL:
        try {
          const routeData = await getRoute();
          setRoute(routeData);
          setInZoom(true);
        } catch (error) {
          console.error(
            'Failed to get route:',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        break;
      case EDITING:
        setInZoom(true);
        break;
    }
  };

  const onEditButtonClick = () => {
    setState(EDITING);
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
    if (state !== EDITING) {
      return;
    }
    console.log('triggered route refresh');
    async function getNewRoute() {
      try {
        const newRouteData = await getRoute();
        if (newRouteData) {
          console.log('new route');
          setRoute(newRouteData);
          setPreviousRoute(null);
        }
      } catch (error) {
        console.error(
          'Error updating route:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
    getNewRoute();
  }, [tripPoints, state, parameter, tripTime, mode]);

  const onPointChange = (
    newPoint: [number, number],
    pointType: POINT_TYPE,
    eventType: 'press' | 'drag'
  ) => {
    setTripPoints((prev) => ({
      ...prev,
      [pointType === START_POINT ? 'startPoint' : 'endPoint']: newPoint,
    }));
    if (state === EDITING && eventType === 'drag') {
      setInZoom(true);
    }
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

  return (
    <View style={styles.container}>
      {state === INITIAL && !inZoom && (
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

      {state === EDITING && !inZoom && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Drag points or change settings</Text>
        </View>
      )}

      <View style={styles.locationButtonContainer}>
        <LocationButton setMapCenter={setMapCenter} />
        <Button
          onPress={() => router.push('/')}
          icon={<FontAwesome6 name="city" size={24} />}
          style={{
            padding: 8,
          }}
        />
      </View>

      <View
        style={[styles.controlPanelContainer, inZoom && { display: 'none' }]}
      >
        <ControlPanel
          open={controlPanelOpen}
          onEndTrip={onEndTripButtonClick}
          onEdit={onEditButtonClick}
          onConfirmSettings={onConfirmButtonClick}
        />
      </View>

      {inZoom && (
        <View style={styles.previewControlButtonContainer}>
          <Button
            onPress={onBackButtonClick}
            style={[styles.previewControlButton, { backgroundColor: 'red' }]}
            color="white"
            fontWeight="bold"
          >
            Back
          </Button>
          <Button
            onPress={onGoButtonClick}
            style={styles.previewControlButton}
            color="white"
            fontWeight="bold"
          >
            Go
          </Button>
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
