import { Button, Group, Stack, Text } from '@mantine/core';

type Props = {
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
  onConfirm: () => void;
  onClear: () => void;
};

function ControlTextField({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text c="var(--mantine-color-gray-6)" fw={500} miw={50}>
        {label}
      </Text>

      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--mantine-color-gray-0)',
          padding: 'var(--mantine-spacing-xs)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        {value ? <Text>{value}</Text> : <Text c="var(--mantine-color-gray-5)">{label}</Text>}
      </div>
    </Group>
  );
}

export default function Control({ start, end, onConfirm, onClear }: Props) {
  return (
    <Stack gap="lg">
      <ControlTextField label="Start" value={start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : ''} />

      <ControlTextField label="End" value={end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : ''} />

      <Group justify="space-between">
        <Button onClick={onConfirm} size="md" radius="md" color="#0466C8" disabled={!start || !end}>
          Confirm
        </Button>

        <Button onClick={onClear} size="md" radius="md" color="#0466C8" variant="outline">
          Clear
        </Button>
      </Group>
    </Stack>
  );
}
