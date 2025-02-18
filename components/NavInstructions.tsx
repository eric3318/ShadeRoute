import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as turf from '@turf/turf';
import { useLocation } from '@/hooks/useLocation/useLocation';

export type Instruction = {
  name: string;
  distance: number;
  points: [number, number][];
  time: number;
  turnDescription: string;
};

type NavInstructionsProps = {
  instructions: Instruction[];
  totalDistance: number;
  onInfoChange: (
    distanceTraveled: number,
    speed: number,
    arrivalTime: number
  ) => void;
};

export default function NavInstructions({
  instructions,
  totalDistance,
  onInfoChange,
}: NavInstructionsProps) {
  const [currentInstruction, setCurrentInstruction] =
    useState<Instruction | null>(instructions[0]);
  const { location, setLocation } = useLocation();
  const [index, setIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [speed, setSpeed] = useState<number>(0);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);

  useEffect(() => {
    const setupLocationTracking = async () => {
      const subscription = await subscribeToLocationUpdates();
      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    };
    setupLocationTracking();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeElapsed = currentTime.getTime() - startTime.getTime();
      const currentSpeed = distanceTraveled / timeElapsed;
      const arrivalTime = startTime.getTime() + totalDistance / currentSpeed;
      setSpeed(currentSpeed);
      onInfoChange(distanceTraveled, currentSpeed, arrivalTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [distanceTraveled, startTime]);

  // useEffect(() => {
  //   const currentTime = new Date();
  //   const timeElapsed = currentTime.getTime() - startTime.getTime();
  //   const currentSpeed = timeElapsed
  //     ? distanceTraveled / timeElapsed
  //     : 0;
  //   const arrivalTime = startTime.getTime() + totalDistance / currentSpeed;
  //   setSpeed(currentSpeed);
  //   onInfoChange(distanceTraveled, currentSpeed, arrivalTime);
  // }, []);

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
        setLocation(coords);
        if (currentInstruction) {
          const distanceFromCurrentInstructionStart = turf.distance(
            turf.point(coords),
            turf.point(currentInstruction.points[0]),
            { units: 'meters' }
          );
          setDistanceTraveled(distanceFromCurrentInstructionStart);

          const from = turf.point(coords);
          const to = turf.point(
            currentInstruction.points[currentInstruction.points.length - 1]
          );
          const distanceUntilNextInstruction = turf.distance(from, to, {
            units: 'meters',
          });
          if (distanceUntilNextInstruction < 10) {
            if (index < instructions.length - 1) {
              setCurrentInstruction(instructions[index + 1]);
              setIndex(index + 1);
            } else {
              setCurrentInstruction(null);
              setIndex(0);
            }
          }
        }
      }
    );
    return locationSubscription;
  };

  return (
    <View style={styles.container}>
      {/* <Image source={require('@/assets/images/arrow-right.png')} /> */}
      {/* <Text>Image here</Text> */}
      <View style={styles.right}>
        <Text style={styles.turnDescriptionText}>
          {instructions?.[0]?.turnDescription}
        </Text>
        <Text style={styles.turnDescriptionText}>
          {instructions?.[0]?.distance.toFixed(1)} m
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
