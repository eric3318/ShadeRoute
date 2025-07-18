import { View, StyleSheet, Image, Alert, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { updateProfile } from 'firebase/auth';

export default function Auth() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
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

    const { user, error } = await signUp(email, password);

    if (error) {
      Alert.alert('Signup failed', error, [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
      ]);

      return;
    }

    if (user && displayName) {
      await updateProfile(user, {
        displayName,
      });
    }

    router.dismiss();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          {isSignUp ? 'Sign Up' : 'Log in'}
        </Text>
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
          <>
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

            <TextInput
              label="Display name (optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="none"
            />
          </>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    rowGap: 12,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  form: {
    rowGap: 12,
  },
});
