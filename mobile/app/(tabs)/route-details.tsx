import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { getDocument } from '@/utils/firebaseHelpers';
export default function RouteDetails() {
  const { routeId } = useLocalSearchParams();

  const getRoute = async () => {
    const route = await getDocument('routes', routeId);
  };

  useEffect(() => {
    getRoute();
  }, []);

  return (
    <View>
      <Text>Route Details</Text>
    </View>
  );
}
