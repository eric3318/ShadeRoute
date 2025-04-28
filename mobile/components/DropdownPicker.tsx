import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { DimensionValue, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

type DropdownPickerProps = {
  options: string[];
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
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
  const [internalVisible, setInternalVisible] = useState<boolean>(false);
  const controlled = visible !== undefined;

  const handleValueChange = (value: string) => {
    onValueChange(value);
  };

  const toggleVisible = () => {
    if (controlled) {
      onVisibilityChange?.(!visible);
    } else {
      setInternalVisible(!internalVisible);
    }
  };

  return (
    <View style={styles.container}>
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

      {(controlled ? visible : internalVisible) && (
        <Picker
          selectedValue={value}
          onValueChange={handleValueChange}
          itemStyle={{ height: 150 }}
          style={[styles.picker, { width: sameWidth ? width : dropdownWidth }]}
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
    top: 52,
    zIndex: 1000,
    borderRadius: 18,
    backgroundColor: 'white',
  },
});
