import { useContext } from 'react';
import { LocationContext } from '@/hooks/useLocation/locationContext';

export const useLocation = () => {
  return useContext(LocationContext);
};
