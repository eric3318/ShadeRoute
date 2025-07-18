import type { Route } from './types';
import { db } from '../../../firebase';
import { addDoc, collection, getDocs, type DocumentData, type WithFieldValue } from 'firebase/firestore';

export function getRouteGeoJson(route: Route): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: route.details.map((detail) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: detail.points },
      properties: {
        coverage: detail.coverage,
      },
    })),
  };
}

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

// export const updateDocument = async (
//   collectionName: string,
//   subCollectionName: string = '',
//   docId: string,
//   data: any,
// ) => {
//   try {
//     const path = `${collectionName}${subCollectionName && `/${subCollectionName}`}`;
//     const collectionRef = collection(db, path);
//     await setDoc(doc(collectionRef, docId), data);
//     return true;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// };

// export const deleteDocument = async (collectionName: string, subCollectionName: string = '', docId: string) => {
//   try {
//     const path = `${collectionName}${subCollectionName && `/${subCollectionName}`}`;
//     const collectionRef = collection(db, path);
//     await deleteDoc(doc(collectionRef, docId));
//     return true;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// };

export async function getDocuments<T>(collectionName: string): Promise<(T & { id: string })[] | null> {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const docs = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...(doc.data() as T),
      };
    });
    return docs;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// export const getDocument = async (collectionName: string, docId: string) => {
//   try {
//     const collectionRef = collection(db, collectionName);
//     const docRef = doc(collectionRef, docId);
//     const snapshot = await getDoc(docRef);
//     return snapshot.data();
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// };
