import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { AuthContext } from './authContext';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticatedUser, setAuthenticatedUser] = useState<
    User | undefined | null
  >();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticatedUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user: authenticatedUser }}>
      {children}
    </AuthContext.Provider>
  );
}
