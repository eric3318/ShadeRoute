import AuthForm from './components/AuthForm';
import { Button, Stack } from '@mantine/core';
import { Text } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import { Link } from 'react-router';

type Props = {
  isSignIn?: boolean;
};

export default function AuthPage({ isSignIn = true }: Props) {
  return (
    <Stack h="100vh" justify="center" align="center">
      <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
        <Button component={Link} to="/" variant="subtle" size="md">
          <IconArrowBackUp size={36} />
        </Button>
      </div>

      <Stack w="400px">
        <Text fz={28} fw="bold">
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
