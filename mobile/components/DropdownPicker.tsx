import { Picker } from '@react-native-picker/picker';
import { DimensionValue, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

type DropdownPickerProps = {
  options: string[];
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  value: string;
  defaultValue: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  icon?: string;
  width?: DimensionValue;
  color?: string;
  dropdownWidth?: DimensionValue;
  sameWidth?: boolean;
};

export default function DropdownPicker({
  options,
  visible,
  onVisibilityChange,
  value,
  defaultValue,
  placeholder,
  onValueChange,
  color = '#023047',
  icon,
  width = '100%',
  dropdownWidth = 200,
  sameWidth = false,
}: DropdownPickerProps) {
  const handleValueChange = (value: string) => {
    onValueChange(value);
  };

  const toggleVisible = () => {
    onVisibilityChange(visible);
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && (
        <Button
          mode="text"
          textColor={color}
          onPress={toggleVisible}
          icon={icon}
          buttonColor={value !== defaultValue ? '#8ecae6' : ''}
          style={[{ width: width }]}
        >
          {value === defaultValue ? (placeholder ?? value) : value}
        </Button>
      )}

      {(Platform.OS === 'ios' ? visible : true) && (
        <Picker
          selectedValue={value}
          onValueChange={handleValueChange}
          itemStyle={{ height: 150 }}
          mode="dialog"
          style={
            Platform.OS === 'ios'
              ? [styles.picker, { width: sameWidth ? width : dropdownWidth }]
              : [styles.androidPicker]
          }
        >
          {options.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexBasis: 0,
    flexGrow: 1,
  },
  picker: {
    position: 'absolute',
    top: 50,
    zIndex: 1000,
    borderRadius: 18,
    backgroundColor: 'white',
  },
  androidPicker: {
    color: 'black',
  },
});
