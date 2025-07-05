import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { router } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { APP_STATE, Mode } from '@/lib/types';
import { Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { Pressable, useAnimatedValue, Animated } from 'react-native';
import React from 'react';

const modeOptions = [
  {
    label: 'Running',
    value: Mode.RUNNING,
    icon: () => <FontAwesome6 name="person-running" size={36} />,
  },
  {
    label: 'Walking',
    value: Mode.WALKING,
    icon: () => <FontAwesome6 name="person-walking" size={36} />,
  },
  {
    label: 'Biking',
    value: Mode.BIKING,
    icon: () => <FontAwesome6 name="person-biking" size={36} />,
  },
];

export default function Index() {
  const { city, cityOptions, setCity, mode, setMode } = useOptions();
  const { state, setState } = useAppState();
  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    coordinates: [number, number];
  } | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const slideAnim = useAnimatedValue(0);

  useEffect(() => {
    setSelectedCity(city);
    setSelectedMode(mode);
  }, [city, mode]);

  const onConfirmButtonClick = () => {
    if (selectedMode && selectedMode !== mode) {
      setMode(selectedMode);
    }

    if (selectedCity && selectedCity !== city) {
      setCity(selectedCity);
      setState(APP_STATE.INITIAL);
      router.replace('/nav');
      return;
    }

    if (state === APP_STATE.INITIAL) {
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

  const onNextButtonClick = () => {
    Animated.timing(slideAnim, {
      toValue: -1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep((prev) => prev + 1);
      slideAnim.setValue(1000);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const onSavedRoutesButtonClick = () => {
    router.push('/routes-saved');
  };

  const renderCityOption = (cityOption: {
    name: string;
    coordinates: [number, number];
  }) => {
    return (
      <Pressable
        onPress={() => setSelectedCity(cityOption)}
        style={[
          {
            flex: 1,
            height: 100,
            backgroundColor: '#F5F5F5',
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
          },
          cityOption.name === selectedCity?.name && {
            borderWidth: 3,
            borderRadius: 6,
            borderColor: '#ee6352',
          },
        ]}
      >
        <Text style={{ fontSize: 20, fontWeight: '600' }}>
          {cityOption.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>
            Select a {currentStep === 1 ? 'Mode' : 'City'}
          </Text>
          <Button
            onPress={onSavedRoutesButtonClick}
            buttonColor="#ee6352"
            textColor="white"
            labelStyle={{ fontSize: 16 }}
            style={{ borderRadius: 6 }}
          >
            Saved Routes
          </Button>
        </View>

        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            display: currentStep === 1 ? 'flex' : 'none',
            rowGap: 24,
          }}
        >
          <View style={styles.modeContainer}>
            {modeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.card,
                  selectedMode === option.value && styles.selectedCard,
                ]}
                onPress={() => setSelectedMode(option.value)}
              >
                {option.icon()}
                <Text style={styles.cardText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Button
            onPress={onNextButtonClick}
            mode="contained"
            icon={() => (
              <FontAwesome6 name="arrow-right" size={20} color="white" />
            )}
            buttonColor="#ee6352"
            labelStyle={{ fontSize: 18 }}
            style={{
              alignSelf: 'center',
              borderRadius: 6,
            }}
          >
            Next
          </Button>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            display: currentStep === 2 ? 'flex' : 'none',
            rowGap: 24,
          }}
        >
          <FlatList
            data={cityOptions}
            renderItem={({ item }) => renderCityOption(item)}
            contentContainerStyle={{ rowGap: 12 }}
            columnWrapperStyle={{ columnGap: 12 }}
            numColumns={2}
            keyExtractor={(item) => item.name}
          />

          <Button
            onPress={onConfirmButtonClick}
            mode="contained"
            icon={() => (
              <FontAwesome6 name="arrow-right" size={20} color="white" />
            )}
            buttonColor="#ee6352"
            labelStyle={{ fontSize: 18 }}
            style={{
              alignSelf: 'center',
              borderRadius: 6,
            }}
          >
            Confirm
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffc857',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
    rowGap: 6,
  },
  headerContainer: {
    position: 'absolute',
    top: '10%',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
  },
  mainButton: {
    padding: 6,
  },
  mainButtonText: {
    fontSize: 18,
  },
  optionsContainer: {
    rowGap: 32,
  },
  modeContainer: {
    rowGap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedCard: {
    borderColor: '#ee6352',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
