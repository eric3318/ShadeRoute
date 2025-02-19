import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { DimensionValue, View } from 'react-native';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type DropdownPickerProps = {
  options: string[];
  defaultValue?: string;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onValueChange: (value: string) => void;
  width?: DimensionValue;
  color?: string;
  dropdownWidth?: DimensionValue;
  sameWidth?: boolean;
};

export default function DropdownPicker({
  options,
  defaultValue,
  visible,
  onVisibilityChange,
  onValueChange,
  color = '#023047',
  width = '100%',
  dropdownWidth = 200,
  sameWidth = false,
}: DropdownPickerProps) {
  const [selectedValue, setSelectedValue] = useState<string>(
    defaultValue ?? options[0]
  );
  const [internalVisible, setInternalVisible] = useState<boolean>(false);
  const controlled = visible !== undefined;

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
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
        mode="outlined"
        textColor={color}
        onPress={toggleVisible}
        labelStyle={styles.buttonLabel}
        style={{ width: width }}
      >
        {selectedValue}
      </Button>
      {(controlled ? visible : internalVisible) && (
        <Picker
          selectedValue={selectedValue}
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
  buttonLabel: {
    marginHorizontal: 0,
  },
  picker: {
    position: 'absolute',
    top: 52,
    zIndex: 1000,
    borderRadius: 18,
    backgroundColor: 'white',
  },
});
