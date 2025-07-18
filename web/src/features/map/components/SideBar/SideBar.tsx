import { Button, Stack } from '@mantine/core';
import SideBarItem from '../SideBarItem/SideBarItem';
import { IconBike, IconMapPin, IconSun, IconArrowBackUp } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { City } from '../../types';
import { Mode } from '../../constants';

type Props = {
  activeItemIndex: number;
  onItemClick: (index: number) => void;
  selectedCity: City;
  selectedMode: Mode;
};

export default function SideBar({ onItemClick, activeItemIndex, selectedCity, selectedMode }: Props) {
  const items = [
    {
      label: selectedCity.name,
      icon: IconMapPin,
    },
    { label: selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1), icon: IconBike },
    { label: 'Shade', icon: IconSun },
  ];

  return (
    <Stack h="100%">
      <Stack align="center" p="xl">
        <Button component={Link} to="/" variant="subtle" h="100%">
          <IconArrowBackUp size={48} />
        </Button>
      </Stack>

      {items.map((item, index) => (
        <SideBarItem
          key={item.label}
          item={item}
          onClick={() => onItemClick(index)}
          active={activeItemIndex === index}
        />
      ))}
    </Stack>
  );
}
