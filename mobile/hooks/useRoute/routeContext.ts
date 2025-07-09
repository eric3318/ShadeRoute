import { createContext } from 'react';
import type { SavedRoute } from '@/lib/types';

type RouteContextType = {
  route: SavedRoute | null;
  setRoute: (route: SavedRoute | null) => void;
};

const RouteContext = createContext<RouteContextType>({
  route: null,
  setRoute: () => {},
});

export { RouteContext };
