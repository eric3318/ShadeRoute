import { View, StyleSheet, Image, SafeAreaView, Text } from 'react-native';

export default function Landing() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/image-1.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.logoText}>ShadePath</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffc857',
  },
  contentContainer: {
    flex: 1,
    rowGap: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
  },
  logo: {
    width: 80,
    height: 80,
  },
});
