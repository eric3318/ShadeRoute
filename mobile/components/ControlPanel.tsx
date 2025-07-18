import { Text, View, StyleSheet, FlatList } from 'react-native';
import TimeDialog from './TimeDialog';
import { useState } from 'react';
import { APP_STATE } from '@/lib/types';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { format } from 'date-fns';
import { Button, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';

type ControlPanelProps = {
  open: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onEdit: () => void;
  onConfirmSettings: () => void;
  inPreview?: boolean;
  navInfo?: {
    distanceTraveled: number;
    averageSpeed: number;
    arrivalTime: number;
    speed: number;
  };
};

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
  const [localParameter, setLocalParameter] = useState<number>(parameter);

  if (!open) return null;

  if (inPreview) {
    return (
      <View style={styles.previewButtonsContainer}>
        <Button
          onPress={onEdit}
          labelStyle={{ fontSize: 18 }}
          textColor="white"
          buttonColor="#FF0000"
          style={styles.previewButton}
        >
          Back
        </Button>

        <Button
          onPress={onStartTrip}
          labelStyle={{ fontSize: 18 }}
          textColor="white"
          buttonColor="#59cd90"
          style={[styles.previewButton, { marginBottom: 12 }]}
        >
          Go
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {state === APP_STATE.NAVIGATING ? (
          <>
            {navInfo && (
              <View style={styles.navInfoContainer}>
                <FlatList
                  data={[
                    { label: 'Distance', value: navInfo.distanceTraveled },
                    { label: 'Current Speed', value: navInfo.speed },
                    { label: 'Average Speed', value: navInfo.averageSpeed },
                    {
                      label: 'Arrival',
                      value: format(navInfo.arrivalTime, 'hh:mm a'),
                    },
                  ]}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        alignItems: 'center',
                        rowGap: 6,
                        width: '50%',
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {item.label}
                      </Text>
                      <Text style={{ fontSize: 16 }}>{item.value}</Text>
                    </View>
                  )}
                  numColumns={2}
                  contentContainerStyle={{
                    flex: 1,
                    rowGap: 12,
                    justifyContent: 'center',
                  }}
                />
              </View>
            )}

            <Button
              onPress={onEndTrip}
              buttonColor="#FF0000"
              textColor="white"
              labelStyle={{ fontSize: 18 }}
              style={{ borderRadius: 6 }}
            >
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
                value={localParameter}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
                onValueChange={setLocalParameter}
                onSlidingComplete={() => setParameter(localParameter)}
                minimumTrackTintColor="#ee6352"
                maximumTrackTintColor="#000000"
                thumbTintColor="#ee6352"
              />
              <Text style={styles.sliderLabel}>Most shade</Text>
            </View>

            <Button
              mode="contained"
              onPress={onConfirmSettings}
              labelStyle={{ fontSize: 18 }}
              style={{ borderRadius: 6, marginBottom: 12 }}
            >
              {state === APP_STATE.EDITING ? 'Go' : 'Confirm'}
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
    height: 220,
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
    width: 80,
  },
  previewButtonsContainer: {
    marginVertical: 24,
    marginHorizontal: 12,
    rowGap: 12,
  },
  previewButton: {
    borderRadius: 6,
  },
  navInfoContainer: {
    flexGrow: 1,
  },
});
