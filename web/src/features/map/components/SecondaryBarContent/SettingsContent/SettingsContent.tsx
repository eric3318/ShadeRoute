import { Stack, Text } from '@mantine/core';
import DatePick from '../../DatePick/DatePick';
import TimePick from '../../TimePick/TimePick';
import ShadeSlider from '../../ShadeSlider/ShadeSlider';

type Props = {
  date: string;
  time: string;
  shade: number;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onShadeChange: (shade: number) => void;
};

export default function SettingsContent({ date, time, shade, onDateChange, onTimeChange, onShadeChange }: Props) {
  return (
    <Stack h="100%" justify="space-between">
      <Stack>
        <Text c="white" size="lg" fw={500}>
          Date
        </Text>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DatePick value={date} onChange={onDateChange} />
        </div>
      </Stack>

      <Stack>
        <Text c="white" size="lg" fw={500}>
          Time
        </Text>

        <TimePick value={time} onChange={onTimeChange} />
      </Stack>

      <Stack>
        <Text c="white" size="lg" fw={500}>
          How much shade?
        </Text>

        <ShadeSlider value={shade} onChange={onShadeChange} />
      </Stack>

      {/* <Button size="md" radius="md" color="#0466C8">
        Apply
      </Button> */}
      <div />
    </Stack>
  );
}
