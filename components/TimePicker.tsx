import { View, Text, SafeAreaView, Button, StyleSheet } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface TimePickerProps {
  mode: 'date' | 'time';
  date: Date | null;
  onTimeChange: (date: Date) => void;
}

export default function TimePicker({
  date,
  mode,
  onTimeChange,
}: TimePickerProps) {
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onTimeChange(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {mode === 'date' ? (
        <DateTimePicker
          testID="datePicker"
          value={date || new Date()}
          onChange={onChange}
          display="spinner"
          mode="date"
        />
      ) : (
        <DateTimePicker
          testID="timePicker"
          value={date || new Date()}
          onChange={onChange}
          display="spinner"
          mode="time"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
