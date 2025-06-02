import { Button, Group } from '@mantine/core';
import github from '../../../../assets/github.png';
import { Link } from 'react-router';
import logoText from '../../../../assets/logo-text.svg';
import { UnstyledButton } from '@mantine/core';

export default function NavBar() {
  return (
    <Group style={{ width: '100%', height: '100%' }} justify="space-between" align="center">
      <Group>
        <UnstyledButton component={Link} to="/">
          <img src={logoText} alt="logo" width={200} />
        </UnstyledButton>
      </Group>

      <Button variant="default" size="md" radius="md" bd={0}>
        <img src={github} alt="github" style={{ height: '100%', width: '100%', padding: '6px 0' }} />
      </Button>
    </Group>
  );
}
