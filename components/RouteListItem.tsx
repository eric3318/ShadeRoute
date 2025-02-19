import { View, StyleSheet, Image, Text } from 'react-native';
import { SavedRoute } from '@/app/(tabs)/routes-saved';
import { format } from 'date-fns';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button, IconButton } from 'react-native-paper';
type RouteListItemProps = {
  route: SavedRoute;
};

export default function RouteListItem({ route }: RouteListItemProps) {
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
        <IconButton
          icon={() => (
            <FontAwesome5 name="arrow-circle-right" size={22} color="#023047" />
          )}
        />
        <IconButton
          icon={() => <FontAwesome5 name="trash" size={22} color="#ef233c" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    columnGap: 18,
    alignItems: 'center',
    padding: 12,
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
