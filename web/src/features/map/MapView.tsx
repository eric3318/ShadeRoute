import Map, { FullscreenControl, GeolocateControl, NavigationControl } from 'react-map-gl/maplibre';
import MapOverlay from './components/MapOverlay/MapOverlay';
import SideBar from './components/SideBar/SideBar';
import SecondaryBar from './components/SecondaryBar/SecondaryBar';
import ContextMenu from './components/ContextMenu/ContextMenu';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

import Control from './components/Control/Control';
import SettingsContent from './components/SecondaryBarContent/SettingsContent/SettingsContent';
import CityContent from './components/SecondaryBarContent/CityContent/CityContent';
import ModeContent from './components/SecondaryBarContent/ModeContent/ModeContent';
import dayjs from 'dayjs';
import { fetchRoute } from './data';
import { Mode } from './constants';

export default function MapView() {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);
  const [secondaryBarOpened, { open, close }] = useDisclosure(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>(''); // set a default city
  const [mode, setMode] = useState<Mode>(Mode.RUNNING);
  const [settings, setSettings] = useState<{ date: string; time: string; shade: number }>({
    date: '',
    time: '',
    shade: 50,
  });

  const onSideBarItemClick = (index: number) => {
    setActiveItemIndex(index);
    open();
  };

  const onSecondaryBarClose = () => {
    close();
    setActiveItemIndex(-1);
  };

  const onConfirmButtonClick = () => {
    if (!start || !end) {
      return;
    }

    let dateTime =
      settings.date && settings.time
        ? dayjs(`${settings.date} ${settings.time}`).toISOString()
        : new Date().toISOString();

    let shade = settings.shade;

    fetchRoute({ start, end, mode, dateTime, shade });
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

  const handleDateChange = (date: string) => {
    setSettings((prev) => ({ ...prev, date }));
  };

  const handleTimeChange = (time: string) => {
    setSettings((prev) => ({ ...prev, time }));
  };

  const handleShadeChange = (shade: number) => {
    setSettings((prev) => ({ ...prev, shade }));
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
        {activeItemIndex === 0 && <CityContent />}
        {activeItemIndex === 1 && <ModeContent />}
        {activeItemIndex === 2 && (
          <SettingsContent
            date={settings.date}
            time={settings.time}
            shade={settings.shade}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onShadeChange={handleShadeChange}
          />
        )}
      </SecondaryBar>
    </div>
  );
}
