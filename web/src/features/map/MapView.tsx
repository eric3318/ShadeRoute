import Map, { FullscreenControl, GeolocateControl, NavigationControl } from 'react-map-gl/maplibre';
import MapOverlay from './components/MapOverlay/MapOverlay';
import SideBar from './components/SideBar/SideBar';
import SecondaryBar from './components/SecondaryBar/SecondaryBar';
import ContextMenu from './components/ContextMenu/ContextMenu';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import ShadeSlider from './components/ShadeSlider/ShadeSlider';
import DatePick from './components/DatePick/DatePick';
import TimePick from './components/TimePick/TimePick';
import { Button, Stack, Text } from '@mantine/core';
import Control from './components/Control/Control';

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
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  const onSideBarItemClick = (index: number) => {
    setActiveItemIndex(index);
    open();
  };

  const onSecondaryBarClose = () => {
    close();
    setActiveItemIndex(-1);
  };

  const onConfirmButtonClick = () => {
    // fetch route
  };

  const onClearButtonClick = () => {
    setStart(null);
    setEnd(null);
  };

  const handleMapRightClick = (event: any) => {
    event.preventDefault();
    const { lngLat, point } = event;

    setContextMenu({
      x: point.x,
      y: point.y,
      lat: lngLat.lat,
      lng: lngLat.lng,
    });
    setMenuOpened(true);
  };

  const handleMapClick = () => {
    if (menuOpened) {
      handleContextMenuClose();
    }
  };

  const handleContextMenuAction = (action: 'set-start' | 'set-end', coordinates: { lat: number; lng: number }) => {
    switch (action) {
      case 'set-start':
        setStart(coordinates);
        break;
      case 'set-end':
        setEnd(coordinates);
        break;
    }
  };

  const handleContextMenuClose = () => {
    setMenuOpened(false);
    setContextMenu(null);
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
        onContextMenu={handleMapRightClick}
        onClick={handleMapClick}
      >
        <NavigationControl />
        <GeolocateControl />
        <FullscreenControl />
      </Map>

      <ContextMenu
        contextMenu={contextMenu}
        opened={menuOpened}
        onClose={handleContextMenuClose}
        onAction={handleContextMenuAction}
      />

      <MapOverlay position="top-left">
        <div style={{ height: '100vh', backgroundColor: '#1C2321', width: '100px', overflowY: 'hidden' }}>
          <SideBar onItemClick={onSideBarItemClick} activeItemIndex={activeItemIndex} />
        </div>
      </MapOverlay>

      {!secondaryBarOpened && (
        <MapOverlay position="bottom-right">
          <div
            style={{
              marginRight: 'var(--mantine-spacing-lg)',
              marginBottom: '48px',
              width: '300px',
              backgroundColor: 'white',
              borderRadius: 'var(--mantine-radius-md)',
              padding: 'var(--mantine-spacing-md)',
            }}
          >
            <Control start={start} end={end} onConfirm={onConfirmButtonClick} onClear={onClearButtonClick} />
          </div>
        </MapOverlay>
      )}

      <SecondaryBar opened={secondaryBarOpened} close={onSecondaryBarClose}>
        {activeItemIndex === 0 && <CityContent items={[]} />}
        {activeItemIndex === 1 && <ModeContent />}
        {activeItemIndex === 2 && <TimeContent />}
        {activeItemIndex === 3 && <ShadeContent />}
      </SecondaryBar>
    </div>
  );
}
