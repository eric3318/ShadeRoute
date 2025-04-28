import { db } from '@/firebaseConfig';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
} from 'firebase/firestore';

export const addDocument = async (
  collectionName: string,
  subCollectionName: string = '',
  data: any
) => {
  try {
    const path = `${collectionName}${subCollectionName && `/${subCollectionName}`}`;
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

export const getDocuments = async (collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const docs = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return docs;
  } catch (err) {
    return null;
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
