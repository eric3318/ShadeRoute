import { View, SafeAreaView, StyleSheet, Text, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth/useAuth';

export default function Auth() {
  const { user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      router.replace('/test');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/test');
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/test');
    } catch (error) {
      console.log(error);
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
