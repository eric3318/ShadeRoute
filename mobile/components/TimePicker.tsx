import { SafeAreaView, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

type TimePickerProps = {
  mode: 'date' | 'time';
  date: Date | null;
  onTimeChange: (date: Date) => void;
};

export default function TimePicker({
  date,
  mode,
  onTimeChange,
}: TimePickerProps) {
  const onChange = (selectedDate: Date) => {
    onTimeChange(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      {mode === 'date' ? (
        <DatePicker
          date={date || new Date()}
          onDateChange={onChange}
          mode="date"
          theme="light"
        />
      ) : (
        <DatePicker
          date={date || new Date()}
          onDateChange={onChange}
          mode="time"
          theme="light"
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
