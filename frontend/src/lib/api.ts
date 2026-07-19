import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

function cleanData(data: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

export const petsApi = {
  getAll: async (clinicId?: string) => {
    const petsRef = collection(db, 'pets');

    const q = clinicId
      ? query(petsRef, where('clinicId', '==', clinicId))
      : petsRef;

    const snapshot = await getDocs(q);

    return snapshot.docs.map((petDoc) => ({
      id: petDoc.id,
      ...petDoc.data(),
    }));
  },

  create: async (pet: Record<string, any>) => {
    const data = cleanData({
      ...pet,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(collection(db, 'pets'), data);

    return {
      id: docRef.id,
      ...pet,
    };
  },

  update: async (id: string, pet: Record<string, any>) => {
    const data = cleanData({
      ...pet,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'pets', id), data);

    return {
      id,
      ...pet,
    };
  },

  remove: async (id: string) => {
    await deleteDoc(doc(db, 'pets', id));

    return {
      id,
      deleted: true,
    };
  },

  getNotes: async (petId: string) => {
    const notesRef = collection(db, 'pets', petId, 'notes');
    const snapshot = await getDocs(notesRef);

    return snapshot.docs.map((noteDoc) => ({
      id: noteDoc.id,
      ...noteDoc.data(),
    }));
  },

  addNote: async (petId: string, note: Record<string, any>) => {
    const data = cleanData({
      ...note,
      createdAt: serverTimestamp(),
    });

    const docRef = await addDoc(collection(db, 'pets', petId, 'notes'), data);

    return {
      id: docRef.id,
      ...note,
    };
  },
};