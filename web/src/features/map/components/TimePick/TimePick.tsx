import { TimePicker } from '@mantine/dates';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function TimePick({ value, onChange }: Props) {
  return <TimePicker value={value} onChange={onChange} withDropdown size="md" styles={{ dropdown: { zIndex: 999 } }} />;
}
