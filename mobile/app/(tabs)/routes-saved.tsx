import { View, StyleSheet, FlatList, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import RouteListItem from '@/components/RouteListItem';
import DropdownPicker from '@/components/DropdownPicker';
import { Button } from 'react-native-paper';
import { SavedRoute } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { getDocuments } from '@/utils/firebaseHelpers';
import { useRoute } from '@/hooks/useRoute/useRoute';
import { useRouter } from 'expo-router';
import { useLocation } from '@/hooks/useLocation/useLocation';

const sortByOptions = [
  'Date Created',
  'Name',
  'Distance',
  'Shade',
  'Trip Date',
];
const cityFilterOptions = ['All', 'Vancouver', 'Toronto', 'New York'];
const modeFilterOptions = ['All', 'walking', 'running', 'biking'];

type SavedRouteWithId = SavedRoute & { id: string };

export default function RoutesSaved() {
  const { user } = useAuth();
  const { requestLocationPermission } = useLocation();
  const { setRoute } = useRoute();
  const router = useRouter();
  const [routes, setRoutes] = useState<SavedRouteWithId[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<SavedRouteWithId[]>([]);
  const [sortBy, setSortBy] = useState<string>('Date Created');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [dropdownStatus, setDropdownStatus] = useState<{
    sortBy: boolean;
    city: boolean;
    mode: boolean;
  }>({
    sortBy: false,
    city: false,
    mode: false,
  });

  useEffect(() => {
    getSavedRoutes();
  }, []);

  const getSavedRoutes = async () => {
    if (!user) {
      return;
    }

    const savedRoutes = await getDocuments<SavedRoute>(
      `users/${user.uid}/routes`
    );

    setRoutes(savedRoutes);
  };

  const onSortByChange = (value: string) => {
    setSortBy(value);
  };

  const onFilterChange = (value: string, filter: string) => {
    switch (filter) {
      case 'city':
        setCityFilter(value);
        break;
      case 'mode':
        setModeFilter(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const newRoutes = applyFilters();

    setFilteredRoutes(newRoutes);
  }, [sortBy, cityFilter, modeFilter, routes]);

  const applyFilters = (): SavedRouteWithId[] => {
    let newRoutes = [...routes];

    if (cityFilter !== 'All') {
      newRoutes = newRoutes.filter((route) => route.city.name === cityFilter);
    }

    if (modeFilter !== 'All') {
      newRoutes = newRoutes.filter((route) => route.mode === modeFilter);
    }

    switch (sortBy) {
      case 'Trip Date':
        newRoutes.sort((a, b) => a.timeStamp - b.timeStamp);
        break;
      case 'Date Created':
        newRoutes.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'Distance':
        newRoutes.sort((a, b) => a.distance - b.distance);
        break;
      case 'Name':
        newRoutes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Shade':
        newRoutes.sort(
          (a, b) => a.weightedAverageCoverage - b.weightedAverageCoverage
        );
        break;
      default:
        break;
    }

    return newRoutes;
  };

  const onVisibilityChange = (
    option: keyof typeof dropdownStatus,
    visible: boolean
  ) => {
    setDropdownStatus((prev) => {
      const newDropdownStatus = { ...prev };
      newDropdownStatus[option] = visible;

      if (visible) {
        for (const val in prev) {
          if (val !== option) {
            newDropdownStatus[val as keyof typeof dropdownStatus] = false;
          }
        }
      }

      return newDropdownStatus;
    });
  };

  const onRoutePress = async (route: SavedRoute) => {
    if (!(await requestLocationPermission())) {
      Alert.alert(
        'Permission for location required',
        'ShadeRoute uses GPS to track and display your location on the map. Your permission is required to use the app.',
        [
          {
            text: 'Go to Settings',
            onPress: async () => await Linking.openSettings(),
          },
        ]
      );
      return;
    }

    setRoute(route);
    router.dismissAll();
    router.replace('/nav');
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <DropdownPicker
          options={sortByOptions}
          value={sortBy}
          defaultValue={sortByOptions[0]}
          icon="sort"
          onValueChange={onSortByChange}
          visible={dropdownStatus.sortBy}
          onVisibilityChange={(newStatus) =>
            onVisibilityChange('sortBy', newStatus)
          }
        />

        <DropdownPicker
          options={cityFilterOptions}
          value={cityFilter}
          defaultValue={cityFilterOptions[0]}
          placeholder="City"
          icon="filter-variant"
          onValueChange={(value) => onFilterChange(value, 'city')}
          visible={dropdownStatus.city}
          onVisibilityChange={(newStatus) =>
            onVisibilityChange('city', newStatus)
          }
        />

        <DropdownPicker
          options={modeFilterOptions}
          value={modeFilter}
          defaultValue={modeFilterOptions[0]}
          placeholder="Mode"
          icon="filter-variant"
          onValueChange={(value) => onFilterChange(value, 'mode')}
          visible={dropdownStatus.mode}
          onVisibilityChange={(newStatus) =>
            onVisibilityChange('mode', newStatus)
          }
          sameWidth
        />
      </View>

      <FlatList
        data={filteredRoutes}
        renderItem={({ item }) => (
          <Button
            onPress={() => onRoutePress(item)}
            theme={{
              colors: {
                primary: '#8ecae6',
              },
            }}
            labelStyle={{
              marginHorizontal: 0,
              marginVertical: 0,
            }}
            style={{
              borderRadius: 32,
            }}
          >
            <RouteListItem route={item} onPress={() => onRoutePress(item)} />
          </Button>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
});
