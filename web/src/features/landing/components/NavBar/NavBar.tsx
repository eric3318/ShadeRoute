import { Button, Group } from '@mantine/core';
import github from '../../../../assets/github.png';
import { Link } from 'react-router';
import logoText from '../../../../assets/logo-text.svg';
import { UnstyledButton } from '@mantine/core';
import { useAuth } from '../../../../features/auth/hooks/useAuth/useAuth';
import styles from './navBar.module.css';

export default function NavBar() {
  const { user } = useAuth();

  return (
    <Group w="100%" h="100%" justify="space-between" align="center">
      <Group>
        <UnstyledButton component={Link} to="/">
          <img src={logoText} alt="logo" width={200} />
        </UnstyledButton>
      </Group>

      <Group gap="xl" className={styles.buttons}>
        <Button variant="default" size="md" radius="md" bd={0}>
          <img src={github} alt="github" style={{ height: '100%', width: '100%', padding: '6px 0' }} />
        </Button>

        {user ? (
          <Button component={Link} to="/profile" color="#0AB6FF" c="black" size="md" radius="md">
            Profile
          </Button>
        ) : (
          <Button
            component={Link}
            to="/sign-in"
            color="#0AB6FF"
            c="black"
            size="md"
            radius="md"
            loading={user === undefined}
          >
            Sign in
          </Button>
        )}
      </Group>
    </Group>
  );
}
