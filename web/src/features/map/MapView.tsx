import Map, { FullscreenControl, GeolocateControl, NavigationControl } from 'react-map-gl/maplibre';
import MapOverlay from './components/MapOverlay/MapOverlay';
import SideBar from './components/SideBar/SideBar';
import SecondaryBar from './components/SecondaryBar/SecondaryBar';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import ShadeSlider from './components/ShadeSlider/ShadeSlider';
import DatePick from './components/DatePick/DatePick';
import TimePick from './components/TimePick/TimePick';
import { Button, Stack, Text } from '@mantine/core';

function CityContent({ items }: { items: any[] }) {
  return (
    <Stack h="100%">
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </Stack>
  );
}

function ModeContent() {
  return <div>Mode</div>;
}

function TimeContent() {
  return <div>Time</div>;
}

function ShadeContent() {
  return (
    <Stack h="100%" justify="space-between">
      <Stack>
        <Text c="white" size="lg" fw={500}>
          Date
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DatePick />
        </div>
      </Stack>

      <Stack>
        <Text c="white" size="lg" fw={500}>
          Time
        </Text>
        <TimePick />
      </Stack>

      <Stack>
        <Text c="white" size="lg" fw={500}>
          How much shade?
        </Text>
        <ShadeSlider />
      </Stack>

      <Button size="md" radius="md" color="#0466C8">
        Apply
      </Button>
    </Stack>
  );
}

export default function MapView() {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);
  const [secondaryBarOpened, { open, close }] = useDisclosure(false);

  const onSideBarItemClick = (index: number) => {
    setActiveItemIndex(index);
    open();
  };

  const onSecondaryBarClose = () => {
    close();
    setActiveItemIndex(-1);
  };

  return (
    <div style={{ height: '100vh' }}>
      <Map
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=GCM8fpRf6jBxjt7iLyjd"
      >
        <NavigationControl />
        <GeolocateControl />
        <FullscreenControl />
      </Map>

      <MapOverlay>
        <div style={{ height: '100vh', backgroundColor: '#1C2321', width: '100px', overflowY: 'hidden' }}>
          <SideBar onItemClick={onSideBarItemClick} activeItemIndex={activeItemIndex} />
        </div>
      </MapOverlay>

      <SecondaryBar opened={secondaryBarOpened} close={onSecondaryBarClose}>
        {activeItemIndex === 0 && <CityContent items={[]} />}
        {activeItemIndex === 1 && <ModeContent />}
        {activeItemIndex === 2 && <TimeContent />}
        {activeItemIndex === 3 && <ShadeContent />}
      </SecondaryBar>
    </div>
  );
}
