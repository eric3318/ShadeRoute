import { useContext } from 'react';
import { AppStateContext } from './appStateContext';

export const useAppState = () => {
  return useContext(AppStateContext);
};
