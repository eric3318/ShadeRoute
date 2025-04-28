import { Text, View, StyleSheet } from 'react-native';
import TimeDialog from './TimeDialog';
import { useState } from 'react';
import { EDITING, NAVIGATING } from '@/lib/types';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { format } from 'date-fns';
import { Button, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';

interface ControlPanelProps {
  open: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onEdit: () => void;
  onConfirmSettings: () => void;
  inPreview?: boolean;
  navInfo?: {
    distanceTraveled: number;
    speed: number;
    arrivalTime: number;
  };
}

export default function ControlPanel({
  open,
  onStartTrip,
  onEndTrip,
  onEdit,
  onConfirmSettings,
  inPreview = false,
  navInfo,
}: ControlPanelProps) {
  const { state } = useAppState();
  const { parameter, setParameter } = useOptions();
  const [timeDialogOpen, setTimeDialogOpen] = useState<boolean>(false);

  if (!open) return null;

  if (inPreview) {
    return (
      <View style={styles.previewButtonsContainer}>
        <Button
          onPress={onEdit}
          style={[styles.previewButton, { backgroundColor: 'red' }]}
        >
          Back
        </Button>

        <Button onPress={onStartTrip} style={styles.previewButton}>
          Go
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {state === NAVIGATING ? (
          <>
            <View style={{ alignSelf: 'flex-end' }}>
              <IconButton
                onPress={onEdit}
                icon={() => (
                  <MaterialIcons name="settings" size={24} color="white" />
                )}
              />
            </View>

            {navInfo && (
              <View style={styles.navInfoContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>
                    <Text style={{ fontWeight: 'bold' }}>Travelled:</Text>{' '}
                    {navInfo.distanceTraveled.toFixed(1)} m
                  </Text>
                  <Text style={{ fontSize: 16 }}>
                    <Text style={{ fontWeight: 'bold' }}>Speed:</Text>{' '}
                    {navInfo.speed.toFixed(1)} m/s
                  </Text>
                </View>

                <Text style={{ fontSize: 16 }}>
                  <Text style={{ fontWeight: 'bold' }}>Arrival:</Text>{' '}
                  {format(new Date(navInfo.arrivalTime), 'HH:mm')}
                </Text>
              </View>
            )}

            <Button onPress={onEndTrip} style={{ backgroundColor: 'red' }}>
              End trip
            </Button>
          </>
        ) : (
          <>
            <View style={styles.tripTimeContainer}>
              <Text style={styles.tripTimeText}>Trip begins</Text>
              <TimeDialog
                open={timeDialogOpen}
                onOpenChange={setTimeDialogOpen}
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Shortest distance</Text>
              <Slider
                style={styles.slider}
                value={parameter}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
                onValueChange={setParameter}
                minimumTrackTintColor="#FF6403"
                maximumTrackTintColor="#000000"
                thumbTintColor="#FF6403"
              />
              <Text style={styles.sliderLabel}>Most shade</Text>
            </View>

            <Button
              onPress={onConfirmSettings}
              buttonColor="#FF6403"
              textColor="white"
            >
              {state === EDITING ? 'Go' : 'Confirm'}
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    height: 200,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tripTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  slider: {
    height: 40,
    flexGrow: 1,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  previewButtonsContainer: {
    marginVertical: 24,
    marginHorizontal: 12,
    rowGap: 12,
  },
  previewButton: {
    backgroundColor: '#FF6403',
  },
  navInfoContainer: {
    rowGap: 6,
  },
});
