import { Alert, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import LocationButton from '@/components/LocationButton';
import Map from '@/components/Map';
import {
  APP_STATE,
  POINT_TYPE,
  Route,
  SavedRoute,
  START_POINT,
  TripPoints,
} from '@/lib/types';
import { useAppState } from '@/hooks/useAppState/useAppState';
import ControlPanel from '@/components/ControlPanel';
import { useOptions } from '@/hooks/useOptions/useOptions';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import NavInstructions from '@/components/NavInstructions';
import * as turf from '@turf/turf';
import { useLocation } from '@/hooks/useLocation/useLocation';
import { addDocument } from '@/utils/firebaseHelpers';
import InputDialog from '@/components/InputDialog';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth/useAuth';

const CLOSE_PROXIMITY_DISTANCE = 500;

export default function Nav() {
  const { user } = useAuth();
  const { state, setState } = useAppState();
  const { city, mode, parameter, date: tripTime } = useOptions();
  const { location, requestLocation } = useLocation();

  const [lastUsedTripTime, setLastUsedTripTime] = useState<number | null>(null);
  const [tripPoints, setTripPoints] = useState<TripPoints>({
    startPoint: null,
    endPoint: null,
  });
  const [route, setRoute] = useState<Route | null>(null);
  const instructions = route?.instructions ?? [];
  const [userRequestedLocation, setUserRequestedLocation] =
    useState<boolean>(false);

  const mapCenter = userRequestedLocation ? location : city?.coordinates;

  const controlPanelOpen =
    (state === APP_STATE.INITIAL &&
      !!tripPoints.startPoint &&
      !!tripPoints.endPoint) ||
    state === APP_STATE.EDITING ||
    state === APP_STATE.NAVIGATING;

  const inPreview =
    (state === APP_STATE.INITIAL || state === APP_STATE.EDITING) && !!route;

  const [imageUri, setImageUri] = useState<string>('');
  const [navInfo, setNavInfo] = useState<{
    distanceTraveled: number;
    averageSpeed: number;
    arrivalTime: number;
    speed: number;
  } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [inputDialogVisible, setInputDialogVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialEdit, setInitialEdit] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [speed, setSpeed] = useState<number>(0);

  const saveRoute = async (name?: string) => {
    if (
      !tripPoints.startPoint ||
      !tripPoints.endPoint ||
      !route ||
      !city ||
      !mode ||
      !lastUsedTripTime ||
      !user
    ) {
      return;
    }

    const path = route.path.map((point) => {
      return { longitude: point[0], latitude: point[1] };
    });

    const details = route.details.map((edge) => {
      return {
        points: edge.points.map((point) => ({
          longitude: point[0],
          latitude: point[1],
        })),
        coverage: edge.coverage,
        distance: edge.distance,
      };
    });

    const routeData: SavedRoute = {
      name: name || 'Untitled',
      start: tripPoints.startPoint,
      end: tripPoints.endPoint,
      path,
      details,
      city: city.name,
      mode,
      parameter,
      timeStamp: lastUsedTripTime,
      distance: route.distance,
      weightedAverageCoverage: route.weightedAverageCoverage,
      createdAt: new Date().toISOString(),
    };

    try {
      const docId = await addDocument(`users/${user.uid}/routes`, routeData);

      if (!docId) {
        Alert.alert('Failed to save route', 'Please try again');
        return;
      }

      console.log('Route saved successfully');
    } catch (err) {
      Alert.alert('Failed to save route', 'Please try again');
    }
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: () => setInputDialogVisible(true) },
    ]);
  };

  const getRoute = async () => {
    if (!tripPoints.startPoint || !tripPoints.endPoint) {
      throw new Error('Origin and destination points are required');
    }

    const payload = {
      fromLat: tripPoints.startPoint[1],
      fromLon: tripPoints.startPoint[0],
      toLat: tripPoints.endPoint[1],
      toLon: tripPoints.endPoint[0],
      mode,
      parameter,
      timeStamp: Math.floor((tripTime ?? new Date()).getTime() / 1000),
    };

    try {
      const response = await fetch(
        // `${process.env.EXPO_PUBLIC_SERVER_URL}/api/route`,
        // 'https://api.shadepath.com/api/route',
        'http://localhost:8080/api/route',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Unsuccessful response from server');
      }

      const { jobId } = await response.json();

      const route = await pollForResult(jobId);

      return route;
    } catch (error) {
      console.error('Error while fetching route:', error);
      return null;
    }
  };

  const pollForResult = (jobId: string): Promise<Route | null> => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            // `${process.env.EXPO_PUBLIC_SERVER_URL}/api/results?jobId=${jobId}`
            // `https://api.shadepath.com/api/results?jobId=${jobId}`
            `http://localhost:8080/api/results?jobId=${jobId}`
          );

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
      setStartTime(new Date());
      setState(APP_STATE.NAVIGATING);
    } else {
      showAlert('You seem far away...', 'Save route for later?');
    }
  };

  const onBackButtonClick = () => {
    setState(APP_STATE.EDITING);
  };

  const onGoButtonClick = async () => {
    await startNavigation();
  };

  const onConfirmButtonClick = async () => {
    setLoading(true);
    switch (state) {
      case APP_STATE.INITIAL:
        const routeData = await getRoute();

        if (routeData) {
          setRoute(routeData);
        }

        break;
      case APP_STATE.EDITING:
        await startNavigation();
        break;
    }
    setLoading(false);
  };

  const onEndTripButtonClick = async () => {
    await saveRoute();
    setTripPoints({
      startPoint: null,
      endPoint: null,
    });
    setRoute(null);
    changeAppState(APP_STATE.INITIAL);
  };

  const changeAppState = (newState: APP_STATE) => {
    setState(newState);
  };

  useEffect(() => {
    if (state !== APP_STATE.EDITING) {
      return;
    }

    if (initialEdit) {
      setInitialEdit(false);
      return;
    }

    const getNewRoute = async () => {
      setLoading(true);
      const newRouteData = await getRoute();

      if (newRouteData) {
        setRoute(newRouteData);
      }

      setLoading(false);
    };

    getNewRoute();
  }, [tripPoints, state, parameter, tripTime, mode]);

  const onPointChange = (newPoint: [number, number], pointType: POINT_TYPE) => {
    setTripPoints((prev) => ({
      ...prev,
      [pointType === START_POINT ? 'startPoint' : 'endPoint']: newPoint,
    }));
  };

  const onInfoChange = (
    distanceTraveled: number,
    averageSpeed: number,
    arrivalTime: number
  ) => {
    setNavInfo({ distanceTraveled, averageSpeed, arrivalTime, speed });
  };

  const onInputDialogSave = async (name: string) => {
    await saveRoute(name);
    onInputDialogClose();
  };

  const onInputDialogClose = () => {
    setInputDialogVisible(false);
  };

  const onEndTrip = () => {};

  const onHeadingChange = (heading: number) => {
    setHeading(heading);
  };

  const onRequestLocation = () => {
    setUserRequestedLocation(true);
  };

  return (
    <View style={styles.container}>
      {state === APP_STATE.INITIAL && !inPreview && (
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

      {state === APP_STATE.EDITING && !inPreview && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Drag points or change settings</Text>
        </View>
      )}

      <View style={styles.locationButtonContainer}>
        <LocationButton onRequestLocation={onRequestLocation} />
        <IconButton
          onPress={() => router.push('/')}
          style={{ backgroundColor: 'white' }}
          icon={() => <FontAwesome5 name="home" size={24} />}
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

      {state === APP_STATE.NAVIGATING && route && instructions && startTime && (
        <View
          style={{
            position: 'absolute',
            top: '12%',
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: '#3fa7d6',
            borderRadius: 16,
            marginHorizontal: 12,
          }}
        >
          <NavInstructions
            instructions={instructions}
            totalDistance={route.distance}
            startTime={startTime}
            onInfoChange={onInfoChange}
            onHeadingChange={onHeadingChange}
            onEndTrip={onEndTrip}
          />
        </View>
      )}

      <Map
        route={route ?? undefined}
        center={mapCenter}
        points={tripPoints}
        heading={heading}
        onPointChange={onPointChange}
      />

      <InputDialog
        title="Saving route..."
        description="Please give it a name: "
        visible={inputDialogVisible}
        onSave={onInputDialogSave}
        onClose={onInputDialogClose}
      />

      {loading && <Loader loading={loading} />}
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
    backgroundColor: '#3fa7d6',
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
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
