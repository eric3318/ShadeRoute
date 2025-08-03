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
    arrivalTime: number | null
  ) => void;
  onHeadingChange: (heading: number) => void;
  onEndTrip: () => void;
  onNewDebugLog: (logContent: string) => void;
};

export default function NavInstructions({
  instructions,
  routePath,
  startTime,
  totalDistance,
  onInfoChange,
  onHeadingChange,
  onEndTrip,
  onNewDebugLog,
}: NavInstructionsProps) {
  const { setLocation } = useLocation();

  const [lastPassedPointIndex, setLastPassedPointIndex] = useState<
    number | null
  >(null);
  const previousDistanceToPointBehind = useRef<number>(0);

  const [instructionText, setInstructionText] = useState<string>('');
  const nextInstructionIdx = useRef<number>(0);
  const [distanceToNextInstruction, setDistanceToNextInstruction] = useState<
    number | null
  >(null);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [isFreeWalking, setIsFreeWalking] = useState<boolean>(false);
  const lastSpokenInstructionIndex = useRef<number | null>(null);
  const lastSpokenAt = useRef<number | null>(null);

  const [distanceTravelled, setDistanceTravelled] = useState<number>(0);

  const processLocationRef = useRef<
    (coords: [number, number], accuracy: number) => void
  >(() => {});

  const processLocation = (coords: [number, number], accuracy: number) => {
    onNewDebugLog(
      `***Processing new location (${coords[0]}, ${coords[1]}) with accuracy ${accuracy}***`
    );

    if (
      lastPassedPointIndex === null &&
      calcDistance(coords, routePath[0]) <= 50
    ) {
      onNewDebugLog(
        '---Navigation has just started and user is within the free walk radius of origin.---'
      );

      setLocation(coords);

      setIsFreeWalking(true);

      setIsOffRoute(false);

      const distance = calcDistance(
        coords,
        routePath[instructions[nextInstructionIdx.current].interval[0]]
      );

      setDistanceToNextInstruction(distance);

      onNewDebugLog(`Update distanceToNextInstruction to ${distance}`);
    } else if (calcDistance(coords, routePath[routePath.length - 1]) <= 20) {
      onNewDebugLog(
        '---Ending trip because the distance to destination is less than 20 meters.---'
      );

      setLocation(coords);

      setIsFreeWalking(false);

      setIsOffRoute(false);

      onEndTrip();
    } else {
      onNewDebugLog(
        '---Finding the closest route segment to the GPS location.---'
      );

      setIsFreeWalking(false);

      let found = false;

      const startIndex = lastPassedPointIndex ?? 0;

      for (let i = startIndex; i < routePath.length - 1; i++) {
        const possiblePointBehind = routePath[i];
        const possiblePointAhead = routePath[i + 1];

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

        if (
          distanceToPossiblePointAhead - accuracy < distanceBetween &&
          distanceToPossiblePointBehind - accuracy < distanceBetween
        ) {
          onNewDebugLog(
            `GPS location is between path points ${i} and ${i + 1}.`
          );

          // find the snap point on the route segment
          const snapPoint = turf.nearestPointOnLine(
            turf.lineString([possiblePointBehind, possiblePointAhead]),
            turf.point(coords)
          );

          const distanceToSnapPoint = calcDistance(
            coords,
            snapPoint.geometry.coordinates as [number, number]
          );

          onNewDebugLog(
            `The distance between snap point and GPS location is ${distanceToSnapPoint - accuracy}.`
          );

          // if the snap point is close enough to the gps location
          if (distanceToSnapPoint - accuracy <= 50) {
            onNewDebugLog(`The distance is close enough.`);

            let distanceTravelledSince = 0;

            // check if the user is moving forward or backward

            if (i !== lastPassedPointIndex) {
              let start = lastPassedPointIndex ?? 0;

              for (let j = start; j < i; j++) {
                distanceTravelledSince += calcDistance(
                  routePath[j],
                  routePath[j + 1]
                );
              }

              distanceTravelledSince +=
                distanceToPossiblePointAhead -
                previousDistanceToPointBehind.current;

              previousDistanceToPointBehind.current = 0;
            } else {
              distanceTravelledSince +=
                distanceToPossiblePointBehind -
                previousDistanceToPointBehind.current;
            }

            onNewDebugLog(
              `Distance travelled since last time is ${distanceTravelledSince} meters`
            );

            if (
              distanceToPossiblePointBehind >
              previousDistanceToPointBehind.current
            ) {
              // user is moving forward
              onNewDebugLog('User is moving forward. Updated new location.');

              setLocation(snapPoint.geometry.coordinates as [number, number]);

              setDistanceTravelled((prev) => prev + distanceTravelledSince);

              setLastPassedPointIndex(i);

              previousDistanceToPointBehind.current =
                distanceToPossiblePointBehind;
            } else {
              // user is moving backward

              onNewDebugLog(
                'User is not moving forward. Keep the previous location.'
              );
            }

            setIsOffRoute(false);

            if (nextInstructionIdx.current < instructions.length) {
              const distanceFromSnapPointToNextInstruction = calcDistance(
                snapPoint.geometry.coordinates as [number, number],
                routePath[instructions[nextInstructionIdx.current].interval[0]]
              );

              setDistanceToNextInstruction(
                distanceFromSnapPointToNextInstruction
              );
            }

            found = true;
            break;
          }

          onNewDebugLog(
            `The distance is not close enough. Trying the next route segment...`
          );
        }
      }

      // user did not follow the route
      if (!found) {
        onNewDebugLog('Did not find a close enough route segment.');

        onNewDebugLog(
          'User is off route. Set location to the actual GPS location.'
        );

        setIsOffRoute(true);

        setLocation(coords);
      }
    }
  };

  processLocationRef.current = processLocation;

  const calcDistance = (point1: [number, number], point2: [number, number]) => {
    return turf.distance(point1, point2, { units: 'meters' });
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
          },
          (location) => {
            const coords: [number, number] = [
              location.coords.longitude,
              location.coords.latitude,
            ];

            const accuracy = location.coords.accuracy ?? 0;

            processLocationRef.current(coords, accuracy);

            setIsReady(true);
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

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startHeadingTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchHeadingAsync((heading) => {
        onHeadingChange(heading.trueHeading);
      });
    };

    startHeadingTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const announce = (instructionContent: string, distance?: number) => {
    try {
      const speech = distance
        ? `${instructionContent} in ${Math.round(distance)} meters`
        : instructionContent;

      Speech.speak(speech);
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  const findNextInstructionIdx = (pathPointIndex: number) => {
    for (let i = 0; i < instructions.length; i++) {
      if (
        instructions[i].interval[0] <= pathPointIndex &&
        instructions[i].interval[1] >= pathPointIndex
      ) {
        return i;
      }
    }
  };

  useEffect(() => {
    if (!distanceToNextInstruction) return;

    if (distanceToNextInstruction > 30) {
      onNewDebugLog(
        `Distance to next instruction too large (${distanceToNextInstruction}). Skipping.`
      );
      return;
    }

    const now = Date.now();

    onNewDebugLog(
      `Distance to next instruction is less than 30 meters: ${distanceToNextInstruction} meters.`
    );

    if (lastSpokenInstructionIndex.current !== nextInstructionIdx.current) {
      onNewDebugLog('The instruction has not been announced.');

      if (!lastSpokenAt.current || now - lastSpokenAt.current > 2000) {
        onNewDebugLog(
          "OK to speak: either we never spoke before, or it's been \> 2s"
        );

        setInstructionText(
          instructions[nextInstructionIdx.current].turnDescription
        );

        onNewDebugLog(`Update displayed instruction.`);

        announce(
          instructions[nextInstructionIdx.current].turnDescription,
          distanceToNextInstruction
        );

        onNewDebugLog('Announced the instruction.');

        lastSpokenInstructionIndex.current = nextInstructionIdx.current;
        lastSpokenAt.current = now;

        nextInstructionIdx.current += 1;

        onNewDebugLog(
          `Proceeded to new instruction ${nextInstructionIdx.current}`
        );
      } else {
        onNewDebugLog('Too soon to speak again. Waiting for the next update.');
      }
    } else {
      onNewDebugLog('The instruction has been announced before. Skipping.');
    }
  }, [distanceToNextInstruction]);

  useEffect(() => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - startTime.getTime()) / 1000;
    const averageSpeed = timeElapsed > 0 ? distanceTravelled / timeElapsed : 0;
    const remainingDistance = totalDistance - distanceTravelled;
    const eta =
      averageSpeed === 0
        ? null
        : currentTime + (remainingDistance / averageSpeed) * 1000;

    onInfoChange(distanceTravelled, averageSpeed, eta);
  }, [distanceTravelled, onInfoChange]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>
          {lastPassedPointIndex === null
            ? isFreeWalking
              ? 'Continue to follow the route'
              : 'Head to the start'
            : isOffRoute
              ? 'Return to the route'
              : instructionText}
        </Text>
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
