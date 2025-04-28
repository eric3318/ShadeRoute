import { View, StyleSheet, Image, Text } from 'react-native';
import { SavedRoute } from '@/app/(tabs)/routes-saved';
import { format } from 'date-fns';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
type RouteListItemProps = {
  route: SavedRoute;
};

export default function RouteListItem({ route }: RouteListItemProps) {
  const router = useRouter();

  const onRoutePress = () => {
    router.push({
      pathname: '/(tabs)/route-details',
      params: {
        routeId: route.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/new-york.jpg')}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={{ fontSize: 12, fontWeight: 600 }}>
          {format(new Date(route.tripTime), 'MMM d HH:mm')} {route.city}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {(route.totalDistance / 1000).toFixed(2)} km
        </Text>
        <Text style={{ fontSize: 12 }}>{route.mode}</Text>
      </View>
      <View style={styles.iconContainer}>
        {/* <IconButton
          onPress={onRoutePress}
          icon={() => (
            <FontAwesome5 name="arrow-circle-right" size={22} color="#023047" />
          )}
        /> */}
        <Button
          mode="contained"
          onPress={onRoutePress}
          icon="arrow-right"
        ></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    columnGap: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  infoContainer: {
    flexGrow: 1,
    rowGap: 8,
  },
  iconContainer: {
    flexDirection: 'row',
  },
});
