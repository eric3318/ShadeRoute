import { DatePicker } from '@mantine/dates';
import styles from './datePick.module.css';

type Props = {
  value: string | null;
  onChange: (value: string) => void;
};

export default function DatePick({ value, onChange }: Props) {
  return <DatePicker value={value} onChange={onChange} size="lg" classNames={styles} />;
}
