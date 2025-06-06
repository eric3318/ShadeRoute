import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  NavigationControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre';
import MapOverlay from './components/MapOverlay/MapOverlay';
import SideBar from './components/SideBar/SideBar';
import SecondaryBar from './components/SecondaryBar/SecondaryBar';
import ContextMenu from './components/ContextMenu/ContextMenu';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDisclosure } from '@mantine/hooks';

import Control from './components/Control/Control';
import SettingsContent from './components/SecondaryBarContent/SettingsContent/SettingsContent';
import CityContent from './components/SecondaryBarContent/CityContent/CityContent';
import ModeContent from './components/SecondaryBarContent/ModeContent/ModeContent';
import dayjs from 'dayjs';
import { fetchCities, fetchRoute, initRouting } from './data';
import { Mode } from './constants';
import type { City, Route } from './types';
import { getRouteGeoJson } from './helpers';
import { LoadingOverlay } from '@mantine/core';
import InstructionList from './components/InstructionList/InstructionList';
import RouteViewControl from './components/Control-RouteView/RouteViewControl';

export default function MapView() {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);
  const [secondaryBarOpened, { open, close }] = useDisclosure(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [instructionListOpened, setInstructionListOpened] = useState<boolean>(false);

  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.RUNNING);
  const [settings, setSettings] = useState<{ date: string; time: string; shade: number }>({
    date: '',
    time: '',
    shade: 50,
  });

  const [route, setRoute] = useState<Route | null>(null);
  const [routeGeoJson, setRouteGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState<string>('San Francisco');

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    async function getData() {
      const cities = await fetchCities();
      setCities(cities);
    }
    getData();
  }, []);

  useEffect(() => {
    if (start && end && route) {
      console.log(settings);
      getNewRoute({
        start,
        end,
        timeStamp:
          settings.date && settings.time
            ? dayjs(`${settings.date} ${settings.time}`).unix()
            : Math.floor(Date.now() / 1000),
        parameter: settings.shade,
        mode,
      });
    }
  }, [settings, mode, start, end]);

  const onSideBarItemClick = (index: number) => {
    setActiveItemIndex(index);
    open();
  };

  const onSecondaryBarClose = () => {
    close();
    setActiveItemIndex(-1);
  };

  const onConfirmButtonClick = async () => {
    if (!start || !end) {
      return;
    }

    const timeStamp =
      settings.date && settings.time
        ? dayjs(`${settings.date} ${settings.time}`).unix()
        : Math.floor(Date.now() / 1000);
    const parameter = settings.shade;

    await getNewRoute({ start, end, timeStamp, parameter, mode });
  };

  const getNewRoute = async ({
    start,
    end,
    timeStamp,
    parameter,
    mode,
  }: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    timeStamp: number;
    parameter: number;
    mode: Mode;
  }) => {
    setIsLoading(true);

    try {
      const initResult = await initRouting({
        fromLat: start.lat,
        fromLon: start.lng,
        toLat: end.lat,
        toLon: end.lng,
        mode,
        timeStamp,
        parameter: parameter * 0.01,
      });

      if (!initResult) {
        return;
      }

      const data = await fetchRoute(initResult.jobId);

      if (!data) {
        return;
      }

      setRoute(data);
      setRouteGeoJson(getRouteGeoJson(data));
    } finally {
      setIsLoading(false);
    }
  };

  const onClearButtonClick = () => {
    setInstructionListOpened(false);
    setStart(null);
    setEnd(null);
    setRoute(null);
    setRouteGeoJson(null);
  };

  const handleMapRightClick = (event: MapLayerMouseEvent) => {
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

  const handleDateChange = async (date: string) => {
    setSettings((prev) => ({ ...prev, date }));
  };

  const handleTimeChange = (time: string) => {
    setSettings((prev) => ({ ...prev, time }));
  };

  const handleShadeChange = (shade: number) => {
    setSettings((prev) => ({ ...prev, shade }));
  };

  const handleModeChange = (mode: Mode) => {
    setMode(mode);
  };

  const handleCityChange = useCallback(
    (cityName: string) => {
      setCity(cityName);

      setRoute(null);
      setRouteGeoJson(null);
      setStart(null);
      setEnd(null);

      const selectedCity = cities.find((city) => city.name === cityName);
      if (selectedCity && mapRef.current) {
        mapRef.current.easeTo({
          center: selectedCity.coordinates,
          zoom: 14,
        });
      }
    },
    [cities],
  );

  return (
    <div style={{ height: '100vh' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=GCM8fpRf6jBxjt7iLyjd"
        onContextMenu={handleMapRightClick}
        onClick={handleMapClick}
        style={{
          marginLeft: '100px',
          width: 'calc(100% - 100px)',
        }}
      >
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'coverage'],
                  0,
                  '#ff4444',
                  0.5,
                  '#ffcc44',
                  1,
                  '#44cc44',
                ],
                'line-width': 4,
              }}
            />
          </Source>
        )}
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

      {!secondaryBarOpened && !isLoading && !instructionListOpened && (
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
            {route ? (
              <RouteViewControl
                route={route}
                onClearButtonClick={onClearButtonClick}
                onInstructionListButtonClick={() => setInstructionListOpened(true)}
              />
            ) : (
              <Control start={start} end={end} onConfirm={onConfirmButtonClick} onClear={onClearButtonClick} />
            )}
          </div>
        </MapOverlay>
      )}

      {!secondaryBarOpened && !isLoading && (
        <MapOverlay position="bottom-right">
          <div
            style={{
              marginRight: 'var(--mantine-spacing-lg)',
              marginBottom: '48px',
              width: '300px',
              backgroundColor: 'white',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <InstructionList
              opened={instructionListOpened}
              onClose={() => setInstructionListOpened(false)}
              instructions={route?.instructions || []}
            />
          </div>
        </MapOverlay>
      )}

      <SecondaryBar opened={secondaryBarOpened} close={onSecondaryBarClose}>
        {activeItemIndex === 0 && <CityContent options={cities} city={city} onCityChange={handleCityChange} />}
        {activeItemIndex === 1 && <ModeContent mode={mode} onModeChange={handleModeChange} />}
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

      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
    </div>
  );
}
