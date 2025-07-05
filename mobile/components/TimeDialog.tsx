import React from 'react';
import { Button, Portal, Dialog } from 'react-native-paper';
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
      <Button
        mode="contained"
        onPress={() => onOpenChangeHandler(true)}
        style={styles.triggerButton}
      >
        {date ? format(date, 'MMM d, hh:mm aaa') : 'Now'}
      </Button>

      <Portal>
        <Dialog visible={open} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title style={{ fontSize: 18, fontWeight: 'bold' }}>
            Change trip time
          </Dialog.Title>

          <Dialog.Content>
            <TimePicker
              mode={mode}
              date={dateValue}
              onTimeChange={setDateValue}
            />

            <View style={styles.buttonContainer}>
              {mode === 'time' && (
                <Button
                  mode="outlined"
                  onPress={onLastButtonClick}
                  textColor="#FF0000"
                  style={styles.lastButton}
                >
                  Choose a different day
                </Button>
              )}

              <Button
                mode="contained"
                onPress={onNextButtonClick}
                style={styles.nextButton}
              >
                Next
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
  },
  triggerButton: {
    borderRadius: 6,
    backgroundColor: '#255f85',
  },
  dialog: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  nextButton: {
    borderRadius: 6,
    backgroundColor: '#255f85',
  },
  lastButton: {
    borderRadius: 6,
    borderColor: '#FF0000',
  },
});

export default TimeDialog;
