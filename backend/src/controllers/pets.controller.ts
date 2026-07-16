import { Request, Response } from 'express';
import { db } from '../config/firebase';

const petsCollection = db.collection('pets');

const getParamId = (idParam: string | string[] | undefined) => {
  if (Array.isArray(idParam)) {
    return idParam[0];
  }

  return idParam;
};

// GET /api/pets?clinicId=xxxx
export const getPets = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.query;
    let queryRef: FirebaseFirestore.Query = petsCollection;

    if (clinicId) {
      queryRef = queryRef.where('clinicId', '==', clinicId);
    }

    const snapshot = await queryRef.get();
    const pets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error al obtener los pacientes', error: (error as Error).message });
  }
};

// POST /api/pets
export const createPet = async (req: Request, res: Response) => {
  try {
    const { name, species, breed, age, owner, clinicId } = req.body;

    if (!name || !species || !breed || !age || !owner) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

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
    res.status(201).json({ id: docRef.id, ...newPet });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ message: 'Error al crear el paciente', error: (error as Error).message });
  }
};

// PUT /api/pets/:id
export const updatePet = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !id.trim()) {
      return res.status(400).json({
        message: 'Identificador de paciente inválido'
      });
    }
    const { name, species, breed, age, owner } = req.body;

    const petRef = petsCollection.doc(id);
    const doc = await petRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const updatedData = { name, species, breed, age, owner };
    await petRef.update(updatedData);

    res.status(200).json({ id, ...doc.data(), ...updatedData });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ message: 'Error al actualizar el paciente', error: (error as Error).message });
  }
};

// DELETE /api/pets/:id
export const deletePet = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !id.trim()) {
      return res.status(400).json({
        message: 'Identificador de paciente inválido'
      });
    }
    const petRef = petsCollection.doc(id);
    const doc = await petRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    await petRef.delete();
    res.status(200).json({ message: 'Paciente eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar el paciente', error: (error as Error).message });
  }
};

// GET /api/pets/:id/notes  (historial clínico)
export const getPetNotes = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !id.trim()) {
      return res.status(400).json({
        message: 'Identificador de paciente inválido'
      });
    }
    const notesSnapshot = await petsCollection
      .doc(id)
      .collection('notes')
      .orderBy('timestamp', 'desc')
      .get();

    const notes = notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener el historial', error: (error as Error).message });
  }
};

// POST /api/pets/:id/notes
export const addPetNote = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    if (!id || !id.trim()) {
      return res.status(400).json({
        message: 'Identificador de paciente inválido'
      });
    }
    const { text, doctor, clinicId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'La nota no puede estar vacía' });
    }

    const newNote = {
      text,
      doctor: doctor || 'Admin',
      clinicId: clinicId || 'clinica_por_defecto',
      timestamp: new Date().toISOString(),
    };

    const noteRef = await petsCollection.doc(id).collection('notes').add(newNote);
    res.status(201).json({ id: noteRef.id, ...newNote });
  } catch (error) {
    console.error('Error al agregar nota:', error);
    res.status(500).json({ message: 'Error al agregar la nota', error: (error as Error).message });
  }
};
