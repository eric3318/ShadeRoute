import { useContext } from 'react';
import { AuthContext } from './authContext';

export function useAuth() {
  const { user } = useContext(AuthContext);

  return { user };
}
