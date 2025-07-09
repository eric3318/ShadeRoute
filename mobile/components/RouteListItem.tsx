import { View, StyleSheet, Image, Text } from 'react-native';
import { format } from 'date-fns';
import { IconButton } from 'react-native-paper';
import { SavedRoute } from '@/lib/types';

type RouteListItemProps = {
  route: SavedRoute;
  onPress: () => void;
};

const COLORS = {
  HIGH: '#51cf66',
  MEDIUM: '#fcc419',
  LOW: '#ff6b6b',
};

export default function RouteListItem({ route, onPress }: RouteListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={{ fontSize: 12, fontWeight: 600 }}>
          {format(new Date(route.timeStamp * 1000), 'MMM d HH:mm')}{' '}
          {route.city.name}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 900 }}>
            {(route.distance / 1000).toFixed(2)} km
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: 900,
              color:
                route.weightedAverageCoverage > 0.66
                  ? COLORS.HIGH
                  : route.weightedAverageCoverage > 0.33
                    ? COLORS.MEDIUM
                    : COLORS.LOW,
            }}
          >
            {(route.weightedAverageCoverage * 100).toFixed(2)}%
          </Text>
        </View>

        <Text style={{ fontSize: 12 }}>{route.mode}</Text>
      </View>

      <View style={styles.iconContainer}>
        <IconButton mode="contained" onPress={onPress} icon="arrow-right" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    columnGap: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  infoContainer: {
    flexGrow: 1,
    rowGap: 8,
  },
  iconContainer: {
    flexDirection: 'row',
  },
});
