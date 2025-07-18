import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as turf from '@turf/turf';
import * as Speech from 'expo-speech';
import { useLocation } from '@/hooks/useLocation/useLocation';
import { Instruction } from '@/lib/types';
import { useRef } from 'react';

type NavInstructionsProps = {
  instructions: Instruction[];
  routePath: [number, number][];
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
  routePath,
  startTime,
  totalDistance,
  onInfoChange,
  onHeadingChange,
  onEndTrip,
}: NavInstructionsProps) {
  const { setLocation } = useLocation();
  const [distanceToNextInstruction, setDistanceToNextInstruction] =
    useState<number>(0);
  const [lastPassedInstructionIndex, setLastPassedInstructionIndex] = useState<
    number | null
  >(null);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const previousDistanceToPointBehind = useRef<number>(0);
  const lastSpokenInstructionIndex = useRef<number | null>(null);
  const lastSpokenAt = useRef<number | null>(null);
  const navStarted = lastPassedInstructionIndex !== null;

  const processLocation = (coords: [number, number]) => {
    // if navigation has just started
    if (lastPassedInstructionIndex === null) {
      if (calcDistance(coords, routePath[0]) <= 100) {
        setLastPassedInstructionIndex(0);
        setIsOffRoute(false);

        if (instructions.length > 1) {
          setDistanceToNextInstruction(
            calcDistance(coords, routePath[instructions[1].interval[0]])
          );
        }
      }

      setLocation(coords);
    } else {
      // find which instruction the gps location is the closest to
      let found = false;

      for (let i = lastPassedInstructionIndex; i < instructions.length; i++) {
        const possiblePointBehind = routePath[instructions[i].interval[0]];
        const possiblePointAhead = routePath[instructions[i].interval[1]];

        const distanceBetween = calcDistance(
          possiblePointBehind,
          possiblePointAhead
        );

        const distanceToPossiblePointBehind = calcDistance(
          coords,
          possiblePointBehind
        );

        const distanceToPossiblePointAhead = calcDistance(
          coords,
          possiblePointAhead
        );

        // if gps location is between two points on the route
        if (
          distanceToPossiblePointAhead < distanceBetween &&
          distanceToPossiblePointBehind < distanceBetween
        ) {
          // find the snap point on the route segment
          const snapPoint = turf.nearestPointOnLine(
            turf.lineString([possiblePointBehind, possiblePointAhead]),
            turf.point(coords)
          );

          const distanceToSnapPoint = calcDistance(
            coords,
            snapPoint.geometry.coordinates as [number, number]
          );

          // if the snap point is close enough to the gps location
          if (distanceToSnapPoint <= 80) {
            // check if the user is moving forward or backward
            if (i !== lastPassedInstructionIndex) {
              previousDistanceToPointBehind.current = 0;
            }

            if (
              distanceToPossiblePointBehind >
              previousDistanceToPointBehind.current
            ) {
              // user is moving forward
              console.log('user is moving forward ');
              setLocation(snapPoint.geometry.coordinates as [number, number]);
              setLastPassedInstructionIndex(i);
              setIsOffRoute(false);
            } else {
              // user is moving backward
              console.log('user is not moving forward');
              setIsOffRoute(false);
            }

            previousDistanceToPointBehind.current =
              distanceToPossiblePointBehind;
            found = true;

            const distanceFromSnapPointToNextInstruction = calcDistance(
              snapPoint.geometry.coordinates as [number, number],
              routePath[instructions[i + 1].interval[0]]
            );

            setDistanceToNextInstruction(
              distanceFromSnapPointToNextInstruction
            );
            break;
          }
        }
      }

      // user did not follow the route
      if (!found) {
        setLocation(coords);
        setIsOffRoute(true);
      }
    }
  };

  useEffect(() => {
    if (navStarted) {
      const now = Date.now();

      if (lastPassedInstructionIndex === 0) {
        if (lastSpokenInstructionIndex.current === null) {
          speakInstruction(instructions[0].turnDescription);
          lastSpokenInstructionIndex.current = 0;
          lastSpokenAt.current = now;
        }
      }

      if (
        distanceToNextInstruction < 30 &&
        lastPassedInstructionIndex + 1 < instructions.length
      ) {
        const nextInstructionIndex = lastPassedInstructionIndex + 1;

        if (
          lastSpokenInstructionIndex.current !== nextInstructionIndex &&
          lastSpokenAt.current &&
          now - lastSpokenAt.current > 3000
        ) {
          speakInstruction(
            instructions[nextInstructionIndex].turnDescription,
            distanceToNextInstruction
          );
          lastSpokenInstructionIndex.current = nextInstructionIndex;
          lastSpokenAt.current = now;
        }
      }
    }
  }, [distanceToNextInstruction, lastPassedInstructionIndex]);

  const calcDistance = (point1: [number, number], point2: [number, number]) => {
    return turf.distance(point1, point2, { units: 'meters' });
  };

  const speakInstruction = (turnDescription: string, distance?: number) => {
    try {
      const speech = distance
        ? `${turnDescription} in ${Math.round(distance)} meters`
        : turnDescription;

      Speech.speak(speech);
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // Use last known location to immediately initialize
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          const coords: [number, number] = [
            lastKnown.coords.longitude,
            lastKnown.coords.latitude,
          ];
          processLocation(coords);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
          },
          (location) => {
            const coords: [number, number] = [
              location.coords.longitude,
              location.coords.latitude,
            ];

            processLocation(coords);
          }
        );
      } catch (error) {
        console.log('Location error:', error);
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // // Heading subscription
  // useEffect(() => {
  //   let subscription: Location.LocationSubscription;

  //   const startHeadingTracking = async () => {
  //     try {
  //       subscription = await Location.watchHeadingAsync((heading) => {
  //         onHeadingChange(heading.trueHeading ?? heading.magHeading ?? 0);
  //       });
  //     } catch (error) {
  //       console.log('Heading error:', error);
  //     }
  //   };

  //   startHeadingTracking();

  //   return () => {
  //     if (subscription) {
  //       subscription.remove();
  //     }
  //   };
  // }, []);

  // // Update navigation info
  // useEffect(() => {
  //   if (!startTime) return;

  //   const interval = setInterval(() => {
  //     const currentTime = new Date();
  //     const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000;
  //     const averageSpeed = timeElapsed > 0 ? distanceTraveled / timeElapsed : 0;
  //     const remainingDistance = totalDistance - distanceTraveled;
  //     const eta =
  //       remainingDistance > 0 && averageSpeed > 0
  //         ? startTime.getTime() + (totalDistance / averageSpeed) * 1000
  //         : startTime.getTime();

  //     onInfoChange(distanceTraveled, averageSpeed, eta, speed);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [distanceTraveled, speed, startTime, totalDistance]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {navStarted && instructions.length > 0 ? (
          <Text style={styles.text}>
            {isOffRoute
              ? 'Off route'
              : instructions[lastPassedInstructionIndex].turnDescription}
          </Text>
        ) : (
          <Text style={styles.text}>Head to the start</Text>
        )}
      </View>
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
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
