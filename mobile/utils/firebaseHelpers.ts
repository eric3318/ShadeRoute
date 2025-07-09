import { db } from '@/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc,
  WithFieldValue,
} from 'firebase/firestore';

export const addDocument = async <T extends WithFieldValue<DocumentData>>(
  path: string,
  data: T
): Promise<string | null> => {
  try {
    const collectionRef = collection(db, path);
    const docRef = await addDoc(collectionRef, data);

    if (!docRef) {
      return null;
    }

    return docRef.id;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const updateDocument = async (
  collectionName: string,
  subCollectionName: string = '',
  docId: string,
  data: any
) => {
  try {
    const path = `${collectionName}${subCollectionName && `/${subCollectionName}`}`;
    const collectionRef = collection(db, path);
    await setDoc(doc(collectionRef, docId), data);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const deleteDocument = async (
  collectionName: string,
  subCollectionName: string = '',
  docId: string
) => {
  try {
    const path = `${collectionName}${subCollectionName && `/${subCollectionName}`}`;
    const collectionRef = collection(db, path);
    await deleteDoc(doc(collectionRef, docId));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getDocuments = async <T>(
  collectionName: string
): Promise<(T & { id: string })[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    return snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }) as (T & { id: string })[];
  } catch (err) {
    return [];
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = doc(collectionRef, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.data();
  } catch (err) {
    return null;
  }
};
