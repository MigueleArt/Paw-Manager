import { NextFunction, Request, Response } from 'express';
import { db } from '../config/firebase';
import { AppError } from '../middlewares/errorMiddleware';

const petsCollection = db.collection('pets');

// GET /api/pets?clinicId=xxxx
export const getPets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clinicId } = req.query;
    let queryRef: FirebaseFirestore.Query = petsCollection;

    if (typeof clinicId === 'string' && clinicId.trim()) {
      queryRef = queryRef.where('clinicId', '==', clinicId);
    }

    const snapshot = await queryRef.get();

    const pets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(pets);
  } catch (error) {
    return next(error);
  }
};

// POST /api/pets
export const createPet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, species, breed, age, owner, clinicId } = req.body;

    const newPet = {
      name,
      species,
      breed,
      age,
      owner,
      clinicId: clinicId || 'clinica_por_defecto',
      lastVisit: new Date().toLocaleDateString('es-ES'),
    };

    const docRef = await petsCollection.add(newPet);

    return res.status(201).json({
      id: docRef.id,
      ...newPet,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/pets/:id
export const updatePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !id.trim()) {
      return next(new AppError('Identificador de paciente inválido.', 400));
    }

    const updatedData = req.body;

    const petRef = petsCollection.doc(id);
    const doc = await petRef.get();

    if (!doc.exists) {
      return next(new AppError('Paciente no encontrado.', 404));
    }

    await petRef.update(updatedData);

    return res.status(200).json({
      id,
      ...doc.data(),
      ...updatedData,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/pets/:id
export const deletePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !id.trim()) {
      return next(new AppError('Identificador de paciente inválido.', 400));
    }

    const petRef = petsCollection.doc(id);
    const doc = await petRef.get();

    if (!doc.exists) {
      return next(new AppError('Paciente no encontrado.', 404));
    }

    await petRef.delete();

    return res.status(200).json({
      status: 'success',
      message: 'Paciente eliminado correctamente.',
      id,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/pets/:id/notes
export const getPetNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !id.trim()) {
      return next(new AppError('Identificador de paciente inválido.', 400));
    }

    const notesSnapshot = await petsCollection
      .doc(id)
      .collection('notes')
      .orderBy('timestamp', 'desc')
      .get();

    const notes = notesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(notes);
  } catch (error) {
    return next(error);
  }
};

// POST /api/pets/:id/notes
export const addPetNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !id.trim()) {
      return next(new AppError('Identificador de paciente inválido.', 400));
    }

    const { text, doctor, clinicId } = req.body;

    const newNote = {
      text,
      doctor: doctor || 'Admin',
      clinicId: clinicId || 'clinica_por_defecto',
      timestamp: new Date().toISOString(),
    };

    const noteRef = await petsCollection
      .doc(id)
      .collection('notes')
      .add(newNote);

    return res.status(201).json({
      id: noteRef.id,
      ...newNote,
    });
  } catch (error) {
    return next(error);
  }
};