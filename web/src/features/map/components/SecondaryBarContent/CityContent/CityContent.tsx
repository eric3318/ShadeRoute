import { Button, Stack, Text, TextInput } from '@mantine/core';
import type { City } from '../../../types';

type Props = {
  options: City[];
  city: string;
  onCityChange: (city: string) => void;
};

export default function CityContent({ options, city, onCityChange }: Props) {
  return (
    <Stack>
      <TextInput placeholder="Search for a city" />

      <Text c="white" size="lg" fw={500}>
        Cities
      </Text>

      {options.map((option) => (
        <Button
          key={option.name}
          onClick={() => onCityChange(option.name)}
          variant="subtle"
          size="md"
          radius="md"
          c={city === option.name ? '#EE6352' : 'white'}
        >
          {option.name}, {option.country}
        </Button>
      ))}
    </Stack>
  );
}
