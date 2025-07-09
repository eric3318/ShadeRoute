import { useContext } from 'react';
import { AuthContext } from './authContext';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { FirebaseError } from '@firebase/util';

export function useAuth() {
  const { user } = useContext(AuthContext);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: userCredential, error: null };
    } catch (err) {
      console.log('Sign in error: ', err);

      let errorMsg = 'Something went wrong. Please try again.';

      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMsg = 'Invalid email address.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMsg = 'Incorrect email or password.';
            break;
          case 'auth/too-many-requests':
            errorMsg = 'Too many attempts. Please try again later.';
            break;
        }
      }

      return { user: null, error: errorMsg };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: userCredential.user, error: null };
    } catch (err) {
      console.log('Sign up error:', err);

      let errorMsg = 'Something went wrong. Please try again.';
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMsg = 'Invalid email address.';
            break;
          case 'auth/email-already-exists':
            errorMsg = 'This email is already in use.';
            break;
          case 'auth/invalid-password':
            errorMsg = 'Password is too weak.';
            break;
        }
      }

      return { user: null, error: errorMsg };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, signIn, signUp, logout };
}
