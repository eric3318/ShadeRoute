import { useState } from 'react';
import { RouteContext } from './routeContext';
import { Route, SavedRoute } from '@/lib/types';

type RouteContextProviderProps = {
  children: React.ReactNode;
};

export function RouteContextProvider({ children }: RouteContextProviderProps) {
  const [route, setRoute] = useState<SavedRoute | null>(null);

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
}
