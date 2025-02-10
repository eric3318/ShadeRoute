import { Text, View, StyleSheet } from 'react-native';
import { Slider } from 'tamagui';
import TimeDialog from './TimeDialog';
import { useState } from 'react';
import { APP_STATE, EDITING, NAVIGATING } from '@/lib/types';
import { Button } from 'tamagui';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppState } from '@/hooks/useAppState/useAppState';
import { useOptions } from '@/hooks/useOptions/useOptions';
interface ControlPanelProps {
  open: boolean;
  onEndTrip: () => void;
  onEdit: () => void;
  onConfirmSettings: () => void;
}

export default function ControlPanel({
  open,
  onEndTrip,
  onEdit,
  onConfirmSettings,
}: ControlPanelProps) {
  const { state } = useAppState();
  const { parameter, setParameter } = useOptions();
  const [timeDialogOpen, setTimeDialogOpen] = useState<boolean>(false);

  if (!open) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {state === NAVIGATING ? (
          <>
            <View style={{ alignSelf: 'flex-end' }}>
              <Button onPress={onEdit} theme="black" style={{ padding: 8 }}>
                <MaterialIcons name="settings" size={24} color="white" />
              </Button>
            </View>

            <Button
              onPress={onEndTrip}
              color="white"
              fontWeight="bold"
              style={{ backgroundColor: 'red' }}
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
              <Text>Shortest distance</Text>
              <Slider
                defaultValue={[parameter]}
                max={1}
                step={0.1}
                width={120}
                onSlideEnd={(e, value) => {
                  setParameter(value);
                }}
              >
                <Slider.Track>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb size="$2" index={0} circular />
              </Slider>

              <Text>Most shade</Text>
            </View>

            {/* todo: move preview control buttons to this component */}
            <Button
              onPress={onConfirmSettings}
              color="white"
              fontWeight="bold"
              style={{ backgroundColor: '#FF6403' }}
            >
              Confirm
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
    justifyContent: 'space-between',
  },
});
