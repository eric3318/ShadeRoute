import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function RootNavigator() {
  return (
    <SafeAreaView style={styles.rootWrapper}>
      <Stack
        screenOptions={{
          header: () => null,
        }}
      >
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
  },
});
