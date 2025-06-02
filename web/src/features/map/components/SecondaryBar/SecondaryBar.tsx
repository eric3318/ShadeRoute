import { Drawer } from '@mantine/core';

type Props = {
  opened: boolean;
  close: () => void;
  children: React.ReactNode;
};

export default function SecondaryBar({ children, opened, close }: Props) {
  return (
    <Drawer.Root
      opened={opened}
      onClose={close}
      styles={{
        root: {
          position: 'absolute',
          left: '100px',
        },
        content: {
          background: 'var(--mantine-color-dark-6)',
        },
        body: {
          height: '100%',
        },
      }}
    >
      <Drawer.Overlay />

      <Drawer.Content>
        <Drawer.Body>{children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
