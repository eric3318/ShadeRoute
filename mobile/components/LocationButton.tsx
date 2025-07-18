import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useLocation } from '@/hooks/useLocation/useLocation';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

type Props = {
  onRequestLocation: () => void;
};

export default function LocationButton({ onRequestLocation }: Props) {
  const { requestLocation } = useLocation();

  const onLocateButtonClick = async () => {
    const newLocation = await requestLocation();

    if (newLocation) {
      onRequestLocation();
    }
  };

  return (
    <IconButton
      onPress={async () => await onLocateButtonClick()}
      style={styles.button}
      icon={() => (
        <FontAwesome6 name="location-crosshairs" size={24} color="#59cd90" />
      )}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
  },
});
