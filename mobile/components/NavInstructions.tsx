import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as turf from '@turf/turf';
import * as Speech from 'expo-speech';
import { useLocation } from '@/hooks/useLocation/useLocation';

import { GeoJsonProperties, Feature, Point } from 'geojson';
import { Instruction } from '@/lib/types';

type NavInstructionsProps = {
  instructions: Instruction[];
  startTime: Date;
  totalDistance: number;
  onInfoChange: (
    distanceTraveled: number,
    averageSpeed: number,
    arrivalTime: number,
    speed: number
  ) => void;
  onHeadingChange: (heading: number) => void;
  onEndTrip: () => void;
};

export default function NavInstructions({
  instructions,
  startTime,
  totalDistance,
  onInfoChange,
  onHeadingChange,
  onEndTrip,
}: NavInstructionsProps) {
  const [currentInstruction, setCurrentInstruction] = useState<Instruction>(
    instructions[0]
  );
  const { setLocation } = useLocation();
  const [index, setIndex] = useState(0);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [
    distanceTraveledCurrentInstruction,
    setDistanceTraveledCurrentInstruction,
  ] = useState<number>(0);
  const [distanceToNextInstruction, setDistanceToNextInstruction] =
    useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [isOnRoute, setIsOnRoute] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    let headingSubscription: Location.LocationSubscription;

    const getLocationSubscription = async () => {
      locationSubscription = await subscribeToLocationUpdates();
    };

    const getHeadingSubscription = async () => {
      headingSubscription = await subscribeToHeadingUpdates();
    };

    getLocationSubscription();
    getHeadingSubscription();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }

      if (headingSubscription) {
        headingSubscription.remove();
      }

      Speech.stop();
    };
  }, []);

  const speakInstruction = async (
    instruction: Instruction,
    distanceToNextInstruction?: number,
    next = false
  ) => {
    const distanceText = `${Math.round(distanceToNextInstruction ?? instruction.distance)} meters`;

    const speech = `${instruction.turnDescription} ${
      next ? 'in' : 'for'
    } ${distanceText}`;

    try {
      Speech.speak(speech, {
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000;
      const averageSpeed = distanceTraveled / timeElapsed;

      const arrivalTime =
        startTime.getTime() +
        (totalDistance / (averageSpeed || 4828 / 3600)) * 1000;

      onInfoChange(distanceTraveled, averageSpeed, arrivalTime, speed);
    }, 1000);
    return () => clearInterval(interval);
  }, [distanceTraveled, speed]);

  const calculateDistance = (
    snappedLocation: turf.helpers.Coord,
    userLocation: turf.helpers.Coord
  ) => {
    const distance = turf.distance(snappedLocation, userLocation, {
      units: 'meters',
    });

    return distance;
  };

  const subscribeToLocationUpdates = async () => {
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
      },
      (location) => {
        const coords: [number, number] = [
          location.coords.longitude,
          location.coords.latitude,
        ];

        if (location.coords.speed) {
          setSpeed(location.coords.speed);
        }

        // update distance traveled

        const point = turf.point(coords);

        let snappedLocation: Feature<Point, GeoJsonProperties> | Point;
        const singlePointInstruction = currentInstruction.points.length <= 1;

        if (singlePointInstruction) {
          snappedLocation = turf.point(currentInstruction.points[0]);
        } else {
          const lineString = turf.lineString(currentInstruction.points);
          snappedLocation = turf.nearestPointOnLine(lineString, point);
        }

        const distance = calculateDistance(snappedLocation, point);

        if (distance > 50) {
          handleOffRoute(coords);
          return;
        }

        if (!isOnRoute) {
          setIsOnRoute(true);
        }

        setLocation([
          snappedLocation.geometry.coordinates[0],
          snappedLocation.geometry.coordinates[1],
        ]);

        let distanceToNextInstruction;

        if (singlePointInstruction) {
          distanceToNextInstruction = currentInstruction.distance - distance;

          if (!isInitial && distanceToNextInstruction < 5) {
            setDistanceTraveled((prev) => prev + currentInstruction.distance);
            setDistanceTraveledCurrentInstruction(0);
          }
        } else {
          const lineString = turf.lineString(currentInstruction.points);

          const lineSlice = turf.lineSlice(
            turf.point(currentInstruction.points[0]),
            snappedLocation,
            lineString
          );

          const distanceFromCurrentInstructionStart = turf.length(lineSlice, {
            units: 'meters',
          });

          distanceToNextInstruction =
            currentInstruction.distance - distanceFromCurrentInstructionStart;

          if (!isInitial) {
            if (distanceToNextInstruction < 5) {
              setDistanceTraveled(
                (prev) =>
                  prev +
                  currentInstruction.distance -
                  distanceTraveledCurrentInstruction
              );
              setDistanceTraveledCurrentInstruction(0);
            } else {
              setDistanceTraveled(
                (prev) =>
                  prev +
                  distanceFromCurrentInstructionStart -
                  distanceTraveledCurrentInstruction
              );

              setDistanceTraveledCurrentInstruction(
                distanceFromCurrentInstructionStart
              );
            }
          }
        }

        setDistanceToNextInstruction(distanceToNextInstruction);

        if (index === 0 && isInitial) {
          setIsInitial(false);
          speakInstruction(currentInstruction, distanceToNextInstruction);
        }

        if (distanceToNextInstruction < 5) {
          handleInstructionChange();
          return;
        }

        if (distanceToNextInstruction < 30) {
          speakNextInstruction(distanceToNextInstruction);
        }
      }
    );
    return locationSubscription;
  };

  const handleOffRoute = (coords: [number, number]) => {
    setLocation(coords);
    const speech = isInitial
      ? 'Please head to the start point'
      : 'Please stay on the route';

    Speech.speak(speech);
    setIsOnRoute(false);
  };

  const handleInstructionChange = () => {
    if (index < instructions.length - 1) {
      setCurrentInstruction(instructions[index + 1]);
      setIndex((prev) => prev + 1);
    } else {
      handleTripEnd();
    }
  };

  const speakNextInstruction = (distanceToNextInstruction: number) => {
    if (index < instructions.length - 1) {
      speakInstruction(
        instructions[index + 1],
        distanceToNextInstruction,
        true
      );
    } else {
      Speech.speak(
        `You will reach your destination in ${distanceToNextInstruction} meters`
      );
    }
  };

  const handleTripEnd = () => {
    // TODO: Add a confirmation dialog
    onEndTrip();
  };

  const subscribeToHeadingUpdates = async () => {
    const headingSubscription = await Location.watchHeadingAsync((heading) => {
      onHeadingChange(heading.trueHeading ?? heading.magHeading);
    });
    return headingSubscription;
  };

  return (
    <View style={styles.container}>
      {isOnRoute ? (
        <View style={styles.right}>
          <Text style={styles.turnDescriptionText}>
            {instructions?.[0]?.turnDescription}
          </Text>
          <Text style={styles.turnDescriptionText}>
            {distanceToNextInstruction.toFixed(1)} m
          </Text>
        </View>
      ) : (
        <View style={styles.right}>
          <Text style={styles.turnDescriptionText}>
            {isInitial
              ? 'Proceed to the start point'
              : 'Please stay on the route'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 100,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  left: {},
  right: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnDescriptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
