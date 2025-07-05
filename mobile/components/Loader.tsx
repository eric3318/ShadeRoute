import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Portal } from 'react-native-paper';

type Props = {
  loading: boolean;
};

export default function Loader({ loading }: Props) {
  return (
    <Portal>
      <View style={styles.container}>
        <ActivityIndicator animating={loading} size="large" color="#3fa7d6" />
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
