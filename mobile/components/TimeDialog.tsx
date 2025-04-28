import React from 'react';
import { Button as RNPButton, Portal, Dialog } from 'react-native-paper';
import { View } from 'react-native';
import TimePicker from './TimePicker';
import { useState } from 'react';
import { format } from 'date-fns';
import { useOptions } from '@/hooks/useOptions/useOptions';
import { StyleSheet } from 'react-native';

type TimeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function TimeDialog({ open, onOpenChange }: TimeDialogProps) {
  const { date, setDate } = useOptions();
  const [dateValue, setDateValue] = useState<Date | null>(date);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const onDateConfirm = (date: Date | null) => {
    setDate(date);
  };

  const onLastButtonClick = () => {
    toggleMode();
  };

  const onNextButtonClick = () => {
    if (mode === 'date') {
      toggleMode();
      return;
    }
    onDateConfirm(dateValue);
    setMode('date');
    onOpenChange(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'date' ? 'time' : 'date'));
  };

  const onOpenChangeHandler = (open: boolean) => {
    setMode('date');
    onOpenChange(open);
  };

  const hideDialog = () => onOpenChangeHandler(false);

  return (
    <>
      <RNPButton
        mode="contained"
        buttonColor="#023047"
        onPress={() => onOpenChangeHandler(true)}
        style={styles.triggerButton}
      >
        {date ? format(date, 'MMM d, hh:mm aaa') : 'Now'}
      </RNPButton>

      <Portal>
        <Dialog visible={open} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title>Trip begins</Dialog.Title>

          <Dialog.Content>
            <TimePicker
              mode={mode}
              date={dateValue}
              onTimeChange={setDateValue}
            />

            <View style={styles.buttonContainer}>
              {mode === 'time' && (
                <RNPButton
                  mode="outlined"
                  onPress={onLastButtonClick}
                  style={styles.button}
                  textColor="#FF0000"
                >
                  Choose a different day
                </RNPButton>
              )}

              <RNPButton
                mode="contained"
                onPress={onNextButtonClick}
                style={styles.button}
              >
                Next
              </RNPButton>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    bottom: '50%',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    marginVertical: 4,
  },
  triggerButton: {
    borderRadius: 8,
  },
});

export default TimeDialog;
