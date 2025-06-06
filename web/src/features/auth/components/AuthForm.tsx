import { useForm } from '@mantine/form';
import { Button, TextInput, PasswordInput } from '@mantine/core';
import { useNavigate } from 'react-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../firebase';

type FormValues = {
  email: string;
  password: string;
  confirmPassword?: string;
};

type AuthFormProps = {
  isSignIn: boolean;
  onSignInSuccess?: () => void;
};

export default function AuthForm({ isSignIn, onSignInSuccess }: AuthFormProps) {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      ...(!isSignIn && { confirmPassword: '' }),
    },
    validate: {
      confirmPassword: (value, values) => (!isSignIn && value !== values.password ? 'Passwords do not match' : null),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (isSignIn) {
      const loginSuccess = await signInWithEmailAndPassword(auth, values.email, values.password);

      if (loginSuccess) {
        if (onSignInSuccess) {
          onSignInSuccess();
        } else {
          navigate('/');
        }
      }
      return;
    }

    const registerSuccess = await createUserWithEmailAndPassword(auth, values.email, values.password);

    if (registerSuccess) {
      navigate('/sign-in');
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 'var(--mantine-spacing-md)',
      }}
    >
      <TextInput
        withAsterisk
        label="Email"
        placeholder="Enter your email"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />

      <PasswordInput
        withAsterisk
        label="Password"
        placeholder="Enter your password"
        type="password"
        key={form.key('password')}
        {...form.getInputProps('password')}
      />

      {!isSignIn && (
        <>
          <PasswordInput
            withAsterisk
            label="Confirm Password"
            placeholder="Confirm your password"
            type="password"
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
            styles={(theme) => ({
              input: {
                '&:focus': {
                  color: theme.colors.red[6],
                  borderColor: theme.colors.red[6],
                },
              },
            })}
          />
        </>
      )}

      <Button type="submit" radius={'md'}>
        {isSignIn ? 'Login' : 'Sign Up'}
      </Button>
    </form>
  );
}
