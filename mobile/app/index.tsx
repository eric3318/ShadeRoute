import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { router } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { EDITING, INITIAL, NAVIGATING } from '@/lib/types';
import { IconButton } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { Image } from 'react-native';
import { useState } from 'react';

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
  const { city, cityOptions, setCity, mode, setMode } = useOptions();
  const { state } = useAppState();
  const [selectedCity, setSelectedCity] = useState<string>(city);

  const onConfirmButtonClick = () => {
    if (selectedCity !== city) {
      setCity(selectedCity);
      router.replace('/nav');
      return;
    }
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

  const renderModeOption = (modeOption: ModeOption) => {
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

  const renderCityOption = (cityOption: {
    name: string;
    center: [number, number];
  }) => {
    return (
      <Button
        onPress={() => setSelectedCity(cityOption.name)}
        style={{ flex: 1 }}
      >
        <View
          style={
            cityOption.name === selectedCity && {
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
            {cityOption.name}
          </Text>
        </View>
      </Button>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Welcome</Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.heading}>Select a city</Text>
          <FlatList
            data={cityOptions}
            renderItem={({ item }) => renderCityOption(item)}
            columnWrapperStyle={styles.iconButtonContainer}
            numColumns={3}
            keyExtractor={(item) => item.name}
          />
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.heading}>Runner, walker, or cyclist?</Text>
          <FlatList
            data={modeOptions}
            renderItem={({ item }) => renderModeOption(item)}
            columnWrapperStyle={styles.iconButtonContainer}
            numColumns={3}
            keyExtractor={(item) => item.label}
          />
        </View>

        <View style={{ rowGap: 12, marginTop: 'auto' }}>
          <Button
            onPress={onConfirmButtonClick}
            buttonColor="#FF6403"
            textColor="white"
            labelStyle={styles.mainButtonText}
            contentStyle={styles.mainButton}
          >
            Explore
          </Button>

          <Button
            onPress={() => router.push('/routes-saved')}
            buttonColor="transparent"
            // textColor="white"
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
    // backgroundColor: '#FB8500',
  },
  contentContainer: {
    flex: 1,
    rowGap: 24,
    paddingTop: 36,
    paddingHorizontal: 18,
  },
  logoContainer: {
    alignItems: 'center',
    rowGap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: 'white',
  },
  logo: {
    width: 150,
    height: 150,
    padding: 12,
    // boxShadow: '0 0 6px 0 rgba(0, 0, 0, 0.5)',
    // borderRadius: '25%',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: 'white',
  },
  iconButtonContainer: {
    columnGap: 12,
  },
  iconButton: {
    flex: 1,
  },
  mainButton: {
    padding: 6,
  },
  mainButtonText: {
    fontSize: 18,
  },
  selectedIconButton: {
    backgroundColor: '#ffb703',
  },
  optionsContainer: {
    rowGap: 32,
  },
});
