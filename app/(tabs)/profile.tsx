import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Route } from '@/lib/types';
import { useState, useEffect } from 'react';
import { getDocuments } from '@/utils/firebaseHelpers';
import RouteListItem from '@/components/RouteListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedRoute = Route & {
  city: string;
  mode: string;
  parameter: number;
  tripTime: string;
  totalDistance: number;
  createdAt: string;
};

export default function Profile() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    getSavedRoutes();
  }, []);

  // const getSavedRoutes = async () => {
  //   try {
  //     const data = await getDocuments('routes');

  //     if (!data) {
  //       console.log('No data found');
  //       return;
  //     }

  //     const routesData = data.map((route) => {
  //       const path = route.path.map(
  //         (point: { longitude: number; latitude: number }) => {
  //           return [point.longitude, point.latitude];
  //         }
  //       );
  //       const edgeDetails = route.details;
  //       return {
  //         edgeDetails,
  //         path,
  //         city: route.city,
  //         mode: route.mode,
  //         parameter: route.parameter,
  //         tripTime: route.tripTime,
  //         totalDistance: route.totalDistance,
  //         createdAt: route.createdAt,
  //       };
  //     });
  //     setRoutes(routesData);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const getSavedRoutes = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const routeKeys = keys.filter((key) => key.startsWith('route:'));
      const savedRoutes: SavedRoute[] = [];
      for (const key of routeKeys) {
        const routeData = await AsyncStorage.getItem(key);
        if (!routeData) {
          console.log('No data found for route: ', key);
          continue;
        }
        const routeObj = JSON.parse(routeData);
        savedRoutes.push(routeObj);
      }
      setRoutes(savedRoutes);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        renderItem={({ item }) => <RouteListItem route={item} />}
        style={{ width: '100%', paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: '#E0E0E0',
              height: 2,
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
