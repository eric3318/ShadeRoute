import { useContext, useEffect, useState } from 'react';
import { RouteContext } from './routeContext';
import { APP_STATE, RouteToResume, SavedRoute } from '@/lib/types';
import { useOptions } from '../useOptions/useOptions';
import { useAppState } from '../useAppState/useAppState';
import { toRoute } from '@/utils/helpers';

export function useRoute() {
  const { route, setRoute } = useContext(RouteContext);
  const [processedRoute, setProcessedRoute] = useState<RouteToResume | null>(
    null
  );
  const { setCity, setMode, setDate, setParameter } = useOptions();
  const { setState } = useAppState();

  useEffect(() => {
    if (route) {
      const processedRoute = toRoute(route);
      setProcessedRoute(processedRoute);
      setCity(route.city);
      setMode(route.mode);
      setDate(new Date(route.timeStamp * 1000));
      setParameter(route.parameter);
      setState(APP_STATE.RESUMING);
    }
  }, [route]);

  const set = (route: SavedRoute) => {
    setRoute(route);
  };

  const clear = () => {
    setRoute(null);
  };

  return {
    route: processedRoute,
    setRoute: set,
    clearRoute: clear,
  };
}
