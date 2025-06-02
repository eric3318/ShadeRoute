import { Stack } from '@mantine/core';
import SideBarItem from '../SideBarItem/SideBarItem';
import { IconBike, IconClock, IconMapPin, IconSun } from '@tabler/icons-react';

const items = [
  {
    label: 'City',
    icon: IconMapPin,
  },
  { label: 'Mode', icon: IconBike },
  { label: 'Time', icon: IconClock },
  { label: 'Shade', icon: IconSun },
];

type Props = {
  activeItemIndex: number;
  onItemClick: (index: number) => void;
};

export default function SideBar({ onItemClick, activeItemIndex }: Props) {
  return (
    <Stack h="100%">
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
