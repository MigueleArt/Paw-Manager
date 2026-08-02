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
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

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

  getAttachments: async (petId: string) => {
    const attachmentsRef = collection(db, 'pets', petId, 'attachments');
    const snapshot = await getDocs(attachmentsRef);

    return snapshot.docs
      .map((attDoc) => ({ id: attDoc.id, ...attDoc.data() }))
      .sort((a: any, b: any) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0));
  },

  addAttachment: async (petId: string, file: File, uploadedBy: string) => {
    const path = `pets/${petId}/attachments/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const data = {
      name: file.name,
      url,
      path,
      type: file.type,
      size: file.size,
      uploadedBy,
      uploadedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'pets', petId, 'attachments'), data);
    return { id: docRef.id, ...data };
  },

  removeAttachment: async (petId: string, attachmentId: string, path: string) => {
    try {
      await deleteObject(ref(storage, path));
    } catch (error) {
      console.warn('El archivo ya no existe en Storage, se elimina solo el registro:', error);
    }

    await deleteDoc(doc(db, 'pets', petId, 'attachments', attachmentId));
    return { id: attachmentId, deleted: true };
  },
};

export const clientsApi = {
  getAll: async (clinicId?: string) => {
    const clientsRef = collection(db, 'clients'); 

    const q = clinicId
      ? query(clientsRef, where('clinicId', '==', clinicId))
      : clientsRef;

    const snapshot = await getDocs(q);

    return snapshot.docs.map((clientDoc) => ({
      id: clientDoc.id,
      ...clientDoc.data(),
    }));
  },

  // Verifica si ya existe un cliente con ese teléfono o email antes de crear
  checkDuplicate: async (phone: string, email: string, clinicId?: string) => {
    const clientsRef = collection(db, 'clients');
    const baseQuery = clinicId
      ? query(clientsRef, where('clinicId', '==', clinicId))
      : clientsRef;

    const snapshot = await getDocs(baseQuery);
    const existing = snapshot.docs.map((d) => d.data());

    const phoneExists = phone
      ? existing.some((c) => c.phone === phone)
      : false;
    const emailExists = email
      ? existing.some((c) => c.email === email)
      : false;

    return { phoneExists, emailExists };
  },

  create: async (client: Record<string, any>) => {
    const data = cleanData({
      ...client,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(collection(db, 'clients'), data);

    return {
      id: docRef.id,
      ...client,
    };
  },

  update: async (id: string, client: Record<string, any>) => {
    const data = cleanData({
      ...client,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'clients', id), data);

    return {
      id,
      ...client,
    };
  },

  remove: async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));

    return {
      id,
      deleted: true,
    };
  },
};