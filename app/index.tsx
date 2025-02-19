import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { router } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { EDITING, INITIAL, NAVIGATING } from '@/lib/types';
import { IconButton } from 'react-native-paper';
import { Button } from 'react-native-paper';
const cityOptions = ['Vancouver', 'Toronto', 'New York'];

const modeOptions = [
  { label: 'running', icon: 'person-running' },
  { label: 'walking', icon: 'person-walking' },
  { label: 'biking', icon: 'person-biking' },
];

type ModeOption = {
  label: string;
  icon: string;
};

export default function Index() {
  const { city, setCity, mode, setMode } = useOptions();
  const { state } = useAppState();

  const onConfirmButtonClick = () => {
    if (state === INITIAL) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push({
          pathname: '/nav',
        });
      }
    } else {
      router.canGoBack() && router.back();
    }
  };

  const renderIconButton = (modeOption: ModeOption) => {
    return (
      <IconButton
        icon={() => <FontAwesome6 name={modeOption.icon} size={28} />}
        onPress={() => setMode(modeOption.label)}
        style={[
          styles.iconButton,
          modeOption.label === mode && styles.selectedIconButton,
        ]}
      />
    );
  };

  const renderCityOption = (cityOption: string) => {
    return (
      <Button onPress={() => setCity(cityOption)} style={{ flex: 1 }}>
        <View
          style={
            cityOption === city && {
              borderBottomWidth: 3,
              borderColor: '#ffb703',
            }
          }
        >
          <Text
            style={{
              lineHeight: 28,
              fontWeight: 'bold',
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            {cityOption}
          </Text>
        </View>
      </Button>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.optionsContainer}>
          <Text style={styles.heading}>Select a city</Text>
          <FlatList
            data={cityOptions}
            renderItem={({ item }) => renderCityOption(item)}
            columnWrapperStyle={styles.iconButtonContainer}
            numColumns={3}
            keyExtractor={(item) => item}
          />
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.heading}>
            Are you a runner, walker, or cyclist?
          </Text>
          <FlatList
            data={modeOptions}
            renderItem={({ item }) => renderIconButton(item)}
            columnWrapperStyle={styles.iconButtonContainer}
            numColumns={3}
            keyExtractor={(item) => item.label}
          />
        </View>

        <View style={{ rowGap: 12 }}>
          <Button onPress={onConfirmButtonClick}>Explore</Button>

          <Button
            onPress={() => router.push('/routes-saved')}
            style={{ alignSelf: 'center' }}
          >
            View saved routes
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FB8500',
  },
  contentContainer: {
    padding: 24,
    rowGap: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButtonContainer: {
    columnGap: 12,
  },
  iconButton: {
    flex: 1,
    padding: 0,
  },
  selectedIconButton: {
    backgroundColor: '#ffb703',
  },
  optionsContainer: {
    rowGap: 32,
  },
});
