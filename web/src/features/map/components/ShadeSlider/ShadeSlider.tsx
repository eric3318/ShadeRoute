import { Slider } from '@mantine/core';
import { useState } from 'react';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function ShadeSlider({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState<number>(value);

  return (
    <Slider
      // marks={[
      //   { value: 0, label: '0%' },
      //   { value: 50, label: '50%' },
      //   { value: 100, label: '100%' },
      // ]}
      value={localValue}
      onChange={setLocalValue}
      onChangeEnd={onChange}
      styles={{
        bar: {
          backgroundImage: 'linear-gradient(90deg, blue,  red)',
        },
      }}
    />
  );
}
