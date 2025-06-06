import { initializeApp } from 'firebase/app';

import { getAnalytics } from 'firebase/analytics';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAWLJoi-GeMbJpwPOMCGhxCv0IQX-4Qr6A',

  authDomain: 'shaderoute-f3c57.firebaseapp.com',

  projectId: 'shaderoute-f3c57',

  storageBucket: 'shaderoute-f3c57.firebasestorage.app',

  messagingSenderId: '44678486115',

  appId: '1:44678486115:web:65c7ceab23d0138ad90056',

  measurementId: 'G-9PM56KNCFJ',
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db, analytics };
