import { View, StyleSheet, Image, Text } from 'react-native';
import { SavedRoute } from '@/app/(tabs)/profile';
import { format } from 'date-fns';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button } from 'tamagui';
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
          {format(new Date(route.createdAt), 'MMM d HH:mm')} {route.city}{' '}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {(route.totalDistance / 1000).toFixed(2)} km
        </Text>
        <Text style={{ fontSize: 12 }}>{route.mode}</Text>
      </View>
      <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 16 }}>
        <Button
          icon={
            <FontAwesome5 name="arrow-circle-right" size={26} color="#023047" />
          }
          p={0}
        />
        <Button
          icon={<FontAwesome5 name="trash" size={26} color="#ef233c" />}
          p={0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    columnGap: 24,
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
});
