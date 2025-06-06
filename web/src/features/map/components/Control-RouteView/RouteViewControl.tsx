import { Button, Group, Stack, Text } from '@mantine/core';
import type { Route } from '../../types';

type Props = {
  route: Route;
  onClearButtonClick: () => void;
  onInstructionListButtonClick: () => void;
};

export default function RouteViewControl({ route, onClearButtonClick, onInstructionListButtonClick }: Props) {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text c="var(--mantine-color-gray-6)" fw={500}>
          Distance
        </Text>

        <Text>{route.distance.toFixed(0)} m</Text>
      </Group>

      <Group justify="space-between">
        <Text c="var(--mantine-color-gray-6)" fw={500}>
          Average Coverage
        </Text>

        <Text>{(route.weightedAverageCoverage * 100).toFixed(1)} %</Text>
      </Group>

      <Stack gap="sm">
        <Button size="md" radius="md" color="#0466C8" fullWidth onClick={onInstructionListButtonClick}>
          Instructions
        </Button>

        <Button size="md" radius="md" color="#0466C8" variant="outline" fullWidth onClick={onClearButtonClick}>
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}
