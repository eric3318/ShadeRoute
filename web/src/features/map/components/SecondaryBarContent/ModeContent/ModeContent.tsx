import { Button, Stack } from '@mantine/core';

import { IconBike } from '@tabler/icons-react';
import { IconRun } from '@tabler/icons-react';
import { IconWalk } from '@tabler/icons-react';
import { Mode } from '../../../constants';

const items = [
  { label: Mode.RUNNING, icon: IconRun },
  { label: Mode.WALKING, icon: IconWalk },
  { label: Mode.BIKING, icon: IconBike },
];

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export default function ModeContent({ mode, onModeChange }: Props) {
  return (
    <Stack align="center" justify="space-between" h="100%" py="lg">
      {items.map((item) => (
        <Button key={item.label} variant="subtle" fullWidth h={200} onClick={() => onModeChange(item.label)}>
          <item.icon color={mode === item.label ? '#EE6352' : '#0466C8'} size={48} />
        </Button>
      ))}
    </Stack>
  );
}
