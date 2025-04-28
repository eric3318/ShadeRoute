import { useContext } from 'react';
import { OptionsContext } from './OptionsContext';

const useOptions = () => {
  return useContext(OptionsContext);
};

export { useOptions };
