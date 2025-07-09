import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  Image,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth/useAuth';

export default function Auth() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert('Signin failed', error, [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
      ]);

      return;
    }

    router.dismiss();
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      Alert.alert('Signup failed', error, [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
      ]);

      return;
    }
  };

  const handleModeToggle = () => {
    setIsSignUp((prev) => !prev);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleShowPassWordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/react-logo.png')} />
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon icon="eye" onPress={handleShowPassWordToggle} />
          }
          autoCapitalize="none"
        />

        {isSignUp && (
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon icon="eye" onPress={handleShowPassWordToggle} />
            }
            autoCapitalize="none"
          />
        )}

        <Button
          mode="contained"
          onPress={isSignUp ? handleSignUp : handleLogin}
        >
          {isSignUp ? 'Create Account' : 'Login'}
        </Button>

        <Button
          onPress={handleModeToggle}
          mode="text"
          rippleColor="transparent"
        >
          {isSignUp
            ? 'Already have an account? Login'
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  form: {
    rowGap: 12,
  },
});
