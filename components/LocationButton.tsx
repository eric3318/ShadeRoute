import { Button } from 'tamagui';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useLocation } from '@/hooks/useLocation/useLocation';
import { StyleSheet } from 'react-native';

interface LocationButtonProps {
  setMapCenter: (center: [number, number] | undefined) => void;
}

export default function LocationButton({ setMapCenter }: LocationButtonProps) {
  const { requestLocation } = useLocation();

  const onLocateButtonClick = async () => {
    setMapCenter(undefined);
    const newLocation = await requestLocation();
    if (newLocation) {
      setMapCenter(newLocation);
    }
  };

  return (
    <Button
      onPress={async () => await onLocateButtonClick()}
      style={styles.button}
      icon={<FontAwesome6 name="location-crosshairs" size={24} color="blue" />}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 0,
  },
});
