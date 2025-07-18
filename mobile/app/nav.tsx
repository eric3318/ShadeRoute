import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
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
import InputDialog from '@/components/InputDialog';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { initRouting, pollResult } from '@/utils/helpers';
import { useRoute } from '@/hooks/useRoute/useRoute';
import { addDocument } from '@/utils/firebaseHelpers';

const CLOSE_PROXIMITY_DISTANCE = 500;

export default function Nav() {
  const { user } = useAuth();
  const { route: routeToResume } = useRoute();

  const { state, setState } = useAppState();
  const { city, mode, parameter, date: tripTime } = useOptions();
  const { location, requestLocation } = useLocation();
  const [tripPoints, setTripPoints] = useState<TripPoints>({
    startPoint: routeToResume?.start ?? null,
    endPoint: routeToResume?.end ?? null,
  });

  const [lastUsedTripTime, setLastUsedTripTime] = useState<number | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

  const instructions =
    state === APP_STATE.RESUMING && routeToResume
      ? routeToResume.instructions
      : (route?.instructions ?? []);

  const [userRequestedLocation, setUserRequestedLocation] =
    useState<boolean>(false);
  const initialEdit = useRef(true);
  const [routeChanged, setRouteChanged] = useState<boolean>(false);

  const mapCenter = userRequestedLocation
    ? location || undefined
    : city?.coordinates;

  const controlPanelOpen =
    (state === APP_STATE.INITIAL &&
      !!tripPoints.startPoint &&
      !!tripPoints.endPoint) ||
    state === APP_STATE.EDITING ||
    state === APP_STATE.NAVIGATING ||
    state === APP_STATE.RESUMING;

  const inPreview =
    ((state === APP_STATE.INITIAL || state === APP_STATE.EDITING) &&
      !!route &&
      routeChanged) ||
    state === APP_STATE.RESUMING;

  const routeToUse =
    state === APP_STATE.RESUMING && routeToResume
      ? routeToResume
      : (route ?? routeToResume);

  const [navInfo, setNavInfo] = useState<{
    distanceTraveled: number;
    averageSpeed: number;
    arrivalTime: number;
    speed: number;
  } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [inputDialogVisible, setInputDialogVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  // const [speed, setSpeed] = useState<number>(0);
  const attemptingSignin = useRef<boolean>(false);

  const handleConfirmSaveRoute = () => {
    if (!user) {
      attemptingSignin.current = true;
      router.push('/auth');
    } else {
      setInputDialogVisible(true);
    }
  };

  useEffect(() => {
    if (attemptingSignin.current && user) {
      setInputDialogVisible(true);
      attemptingSignin.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (routeToResume) {
      setTripPoints({
        startPoint: routeToResume.start,
        endPoint: routeToResume.end,
      });
    }
  }, [routeToResume]);

  const saveRoute = async (
    routeData: SavedRoute,
    path: string
  ): Promise<void> => {
    await addDocument(path, routeData);
  };

  const buildRouteData = (name?: string): SavedRoute => {
    if (
      !tripPoints.startPoint ||
      !tripPoints.endPoint ||
      !route ||
      !city ||
      !mode ||
      !lastUsedTripTime ||
      !user
    ) {
      throw new Error('Missing required data for building saved route');
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
      city,
      mode,
      parameter,
      instructions,
      timeStamp: lastUsedTripTime,
      distance: route.distance,
      weightedAverageCoverage: route.weightedAverageCoverage,
      createdAt: new Date().toISOString(),
    };

    return routeData;
  };

  const calcDistance = (from: [number, number], to: [number, number]) => {
    const fromPoint = turf.point([from[0], from[1]]);
    const toPoint = turf.point([to[0], to[1]]);
    return turf.distance(fromPoint, toPoint, { units: 'meters' });
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
    } else if (state !== APP_STATE.RESUMING) {
      Alert.alert('You seem far away...', 'Save route for later?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'OK', onPress: handleConfirmSaveRoute },
      ]);
    } else {
      Alert.alert('You seem far away...', 'Go back and try a closer route.', [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
      ]);
    }
  };

  const getRoute = async () => {
    try {
      if (!tripPoints.startPoint || !tripPoints.endPoint) {
        throw new Error('Missing start or end point');
      }

      setLoading(true);

      const timeStamp = Math.floor((tripTime ?? new Date()).getTime() / 1000);

      const payload = {
        fromLat: tripPoints.startPoint[1],
        fromLon: tripPoints.startPoint[0],
        toLat: tripPoints.endPoint[1],
        toLon: tripPoints.endPoint[0],
        mode,
        parameter,
        timeStamp,
      };

      const initResult = await initRouting(payload);

      if (!initResult) {
        throw new Error('Failed to initialize routing');
      }

      const route = await pollResult(initResult.jobId);

      if (!route) {
        throw new Error('Failed to poll routing result');
      }

      setLastUsedTripTime(timeStamp);
      setRoute(route);
      setRouteChanged(true);
    } catch (error) {
      console.error('Error getting route:', error);
    } finally {
      setLoading(false);
    }
  };

  const onBackButtonClick = () => {
    setRouteChanged(false);
    setState(APP_STATE.EDITING);
  };

  const onGoButtonClick = async () => {
    await startNavigation();
  };

  const onConfirmButtonClick = async () => {
    switch (state) {
      case APP_STATE.INITIAL:
        await getRoute();
        break;
      case APP_STATE.EDITING:
        await startNavigation();
        break;
    }
  };

  const onEndTripButtonClick = async () => {
    setTripPoints({
      startPoint: null,
      endPoint: null,
    });
    setRoute(null);
    setRouteChanged(false);
    setState(APP_STATE.INITIAL);
  };

  useEffect(() => {
    if (state !== APP_STATE.EDITING) {
      return;
    }

    if (initialEdit.current) {
      initialEdit.current = false;
      return;
    }

    (async () => {
      await getRoute();
    })();
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
    arrivalTime: number,
    currentSpeed: number
  ) => {
    setNavInfo({
      distanceTraveled,
      averageSpeed,
      arrivalTime,
      speed: currentSpeed,
    });
  };

  const onInputDialogSave = async (name: string) => {
    try {
      const routeData = buildRouteData(name);
      await saveRoute(routeData, `users/${user?.uid}/routes`);
      onInputDialogClose();
    } catch (err) {
      console.log(err);
      Alert.alert('Failed to save route', 'Please try again');
    }
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
            routePath={route.path}
            totalDistance={route.distance}
            startTime={startTime}
            onInfoChange={onInfoChange}
            onHeadingChange={onHeadingChange}
            onEndTrip={onEndTrip}
          />
        </View>
      )}

      <Map
        route={routeToUse}
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
    bottom: '30%',
    left: 0,
    zIndex: 1,
  },
  promptContainer: {
    position: 'absolute',
    top: '10%',
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
