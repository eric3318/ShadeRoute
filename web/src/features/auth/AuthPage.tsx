import AuthForm from './components/AuthForm';
import { Stack } from '@mantine/core';
import { Text } from '@mantine/core';
import { Link } from 'react-router';

type Props = {
  isSignIn?: boolean;
};

export default function AuthPage({ isSignIn = true }: Props) {
  return (
    <Stack justify="center" align="center" style={{ height: '100vh' }}>
      <Stack w="400px">
        <Text size="xl" fw="bold">
          {isSignIn ? 'Login' : 'Sign Up'}
        </Text>

        <AuthForm isSignIn={isSignIn} />

        {isSignIn ? (
          <Text>
            Don't have an account? <Link to="/sign-up">Sign up</Link>
          </Text>
        ) : (
          <Text>
            Already have an account? <Link to="/sign-in">Log in</Link>
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
