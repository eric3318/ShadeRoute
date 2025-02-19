import { View, StyleSheet, FlatList } from 'react-native';
import { Route } from '@/lib/types';
import { useState, useEffect } from 'react';
import RouteListItem from '@/components/RouteListItem';
import { getDocuments } from '@/utils/firebaseHelpers';
import DropdownPicker from '@/components/DropdownPicker';

export type SavedRoute = Route & {
  name: string;
  city: string;
  mode: string;
  parameter: number;
  tripTime: string;
  totalDistance: number;
  createdAt: string;
};

const sortByOptions = ['Trip Date', 'Add Date', 'Distance', 'Name'];
const cityFilterOptions = ['All', 'Vancouver', 'Toronto', 'New York'];
const modeFilterOptions = ['All', 'walking', 'running', 'biking'];

export default function RoutesSaved() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<SavedRoute[]>([]);
  const [sortBy, setSortBy] = useState<string>(sortByOptions[0]);
  const [cityFilter, setCityFilter] = useState<string>(cityFilterOptions[0]);
  const [modeFilter, setModeFilter] = useState<string>(modeFilterOptions[0]);
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
    try {
      const data = await getDocuments('routes');

      if (!data) {
        console.log('No data found');
        return;
      }

      const routesData = data.map((route) => {
        const path = route.path.map(
          (point: { longitude: number; latitude: number }) => {
            return [point.longitude, point.latitude];
          }
        );
        const edgeDetails = route.details;
        return {
          name: route.name ?? 'Untitled',
          edgeDetails,
          path,
          city: route.city,
          mode: route.mode,
          parameter: route.parameter,
          tripTime: route.tripTime,
          totalDistance: route.totalDistance,
          createdAt: route.createdAt,
        };
      });
      setRoutes(routesData);
      setFilteredRoutes(routesData);
    } catch (err) {
      console.log(err);
    }
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
    let currRoutes = routes;
    if (cityFilter !== 'All') {
      currRoutes = currRoutes.filter((route) => route.city === cityFilter);
    }
    if (modeFilter !== 'All') {
      currRoutes = currRoutes.filter((route) => route.mode === modeFilter);
    }
    setFilteredRoutes(currRoutes);
  }, [cityFilter, modeFilter]);

  useEffect(() => {
    if (sortBy === 'Trip Date') {
      setFilteredRoutes((prev) =>
        prev.sort(
          (a, b) =>
            new Date(a.tripTime).getTime() - new Date(b.tripTime).getTime()
        )
      );
    } else if (sortBy === 'Add Date') {
      setFilteredRoutes((prev) =>
        prev.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    } else if (sortBy === 'Distance') {
      setFilteredRoutes((prev) =>
        prev.sort((a, b) => a.totalDistance - b.totalDistance)
      );
    } else if (sortBy === 'Name') {
      setFilteredRoutes((prev) =>
        prev.sort((a, b) => a.city.localeCompare(b.city))
      );
    }
  }, [sortBy]);

  const onVisibilityChange = (option: string, newStatus: boolean) => {
    setDropdownStatus((prev) => {
      const newState = { ...prev };
      newState[option] = newStatus;
      if (newStatus === true) {
        for (const val in prev) {
          if (val !== option) {
            newState[val] = false;
          }
        }
      }
      return newState;
    });
  };

  // const getSavedRoutes = async () => {
  //   try {
  //     const keys = await AsyncStorage.getAllKeys();
  //     const routeKeys = keys.filter((key) => key.startsWith('route:'));
  //     const savedRoutes: SavedRoute[] = [];
  //     for (const key of routeKeys) {
  //       const routeData = await AsyncStorage.getItem(key);
  //       if (!routeData) {
  //         console.error('No data found for route: ', key);
  //         continue;
  //       }
  //       const routeObj = JSON.parse(routeData);
  //       savedRoutes.push(routeObj);
  //     }
  //     setRoutes(savedRoutes);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <DropdownPicker
          options={sortByOptions}
          value={sortBy}
          onValueChange={onSortByChange}
          visible={dropdownStatus.sortBy}
          onVisibilityChange={(newStatus) =>
            onVisibilityChange('sortBy', newStatus)
          }
        />
        <DropdownPicker
          options={cityFilterOptions}
          value={cityFilter}
          onValueChange={(value) => onFilterChange(value, 'city')}
          visible={dropdownStatus.city}
          onVisibilityChange={(newStatus) =>
            onVisibilityChange('city', newStatus)
          }
        />
        <DropdownPicker
          options={modeFilterOptions}
          value={modeFilter}
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
        renderItem={({ item }) => <RouteListItem route={item} />}
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
    padding: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
});
