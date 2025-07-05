import type { User } from 'firebase/auth';
import { createContext } from 'react';

type AuthContextType = {
  user: User | undefined | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
});
