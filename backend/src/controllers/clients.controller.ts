import { Request, Response } from 'express';
import { db } from '../config/firebase';

const clientsCollection = db.collection('clients');
const petsCollection = db.collection('pets');

// GET /api/clients?clinicId=xxxx&q=carlos
// Lista clientes de una clínica. Si viene "q", filtra por nombre/teléfono/email (autocompletado).
export const getClients = async (req: Request, res: Response) => {
  try {
    const { clinicId, q } = req.query;

    if (!clinicId) {
      return res.status(400).json({ message: 'clinicId es requerido' });
    }

    const snapshot = await clientsCollection.where('clinicId', '==', clinicId).get();
    let clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    if (q) {
      const term = (q as string).trim().toLowerCase();
      const normalizedTermPhone = term.replace(/[\s\-()]/g, '');
      clients = clients.filter((c) => {
        const name = (c.name || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').replace(/[\s\-()]/g, '');
        return (
          name.includes(term) ||
          email.includes(term) ||
          (normalizedTermPhone && phone.includes(normalizedTermPhone))
        );
      });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes', error: (error as Error).message });
  }
};

// GET /api/clients/:id
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await clientsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener el cliente', error: (error as Error).message });
  }
};

// POST /api/clients
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, clinicId } = req.body;

    if (!name || !clinicId) {
      return res.status(400).json({ message: 'El nombre del cliente y clinicId son obligatorios' });
    }

    const newClient = {
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
      clinicId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await clientsCollection.add(newClient);
    res.status(201).json({ id: docRef.id, ...newClient });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear el cliente', error: (error as Error).message });
  }
};

// PUT /api/clients/:id
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const clientRef = clientsCollection.doc(id);
    const doc = await clientRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const updatedData = { name, phone: phone || '', email: email || '', address: address || '' };
    await clientRef.update(updatedData);

    // Mantener sincronizados los campos denormalizados (owner/ownerPhone) en los pacientes vinculados
    const linkedPetsSnapshot = await petsCollection.where('clientId', '==', id).get();
    const batch = db.batch();
    linkedPetsSnapshot.docs.forEach((petDoc) => {
      batch.update(petDoc.ref, { owner: updatedData.name, ownerPhone: updatedData.phone });
    });
    if (!linkedPetsSnapshot.empty) {
      await batch.commit();
    }

    res.status(200).json({ id, ...doc.data(), ...updatedData });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar el cliente', error: (error as Error).message });
  }
};

// DELETE /api/clients/:id
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const linkedPetsSnapshot = await petsCollection.where('clientId', '==', id).limit(1).get();
    if (!linkedPetsSnapshot.empty) {
      return res.status(409).json({
        message: 'No se puede eliminar: este cliente tiene mascotas vinculadas. Reasigna o elimina sus pacientes primero.',
      });
    }

    const clientRef = clientsCollection.doc(id);
    const doc = await clientRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await clientRef.delete();
    res.status(200).json({ message: 'Cliente eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar el cliente', error: (error as Error).message });
  }
};

// GET /api/clients/:id/pets — mascotas vinculadas a un cliente (relación 1→N real)
export const getClientPets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await petsCollection.where('clientId', '==', id).get();
    const pets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error al obtener mascotas del cliente:', error);
    res.status(500).json({ message: 'Error al obtener las mascotas del cliente', error: (error as Error).message });
  }
};