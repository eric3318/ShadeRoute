import { Button, Stack, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

type Props = {
  item: {
    label: string;
    icon: Icon;
  };
  onClick: () => void;
  active: boolean;
};

export default function SideBarItem({ item, onClick, active }: Props) {
  return (
    <Button
      variant="subtle"
      style={{ flex: 1 }}
      onClick={onClick}
      styles={{
        root: {
          ...(active && {
            backgroundColor: '#0466C8',
          }),
        },
      }}
    >
      <Stack align="center">
        <item.icon size={48} color={active ? '#EE6352' : '#0466C8'} />

        <Text c="#fff" fz="xl" fw={500}>
          {item.label}
        </Text>
      </Stack>
    </Button>
  );
}
