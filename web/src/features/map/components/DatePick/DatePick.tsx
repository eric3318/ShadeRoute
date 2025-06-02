import { useState } from 'react';
import { DatePicker } from '@mantine/dates';
import styles from './datePick.module.css';

export default function DatePick() {
  const [value, setValue] = useState<Date | null>(null);

  return <DatePicker value={value} onChange={setValue} size="lg" classNames={styles} />;
}
