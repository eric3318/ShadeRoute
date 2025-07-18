import { Button, Stack, Text, TextInput } from '@mantine/core';
import type { City } from '../../../types';

type Props = {
  options: City[];
  city: City | null;
  onCityChange: (city: City) => void;
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
          onClick={() => onCityChange(option)}
          variant="subtle"
          size="md"
          radius="md"
          c={city?.name === option.name ? '#EE6352' : 'white'}
        >
          {option.name}, {option.country}
        </Button>
      ))}
    </Stack>
  );
}
