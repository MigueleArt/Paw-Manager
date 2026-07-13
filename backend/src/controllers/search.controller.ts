import { Request, Response } from 'express';
import { db } from '../config/firebase';

const clientsCollection = db.collection('clients');
const petsCollection = db.collection('pets');

const normalizePhone = (value: string) => (value || '').replace(/[\s\-()]/g, '');

// GET /api/search?clinicId=xxxx&q=carlos
// Agrupa resultados por Cliente -> sus mascotas vinculadas, usando la relación real
// clientId (Cliente 1 -> N Paciente), no coincidencia de texto libre.
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { clinicId, q } = req.query;

    if (!clinicId) {
      return res.status(400).json({ message: 'clinicId es requerido' });
    }

    const term = ((q as string) || '').trim().toLowerCase();
    const normalizedTermPhone = normalizePhone(term);

    if (term.length < 2) {
      return res.status(200).json({ query: term, totalClients: 0, totalPets: 0, clients: [] });
    }

    const [clientsSnapshot, petsSnapshot] = await Promise.all([
      clientsCollection.where('clinicId', '==', clinicId).get(),
      petsCollection.where('clinicId', '==', clinicId).get(),
    ]);

    const allClients = clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
    const allPets = petsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    // Índice: clientId -> sus mascotas (relación 1 -> N real, no agrupación por texto)
    const petsByClient = new Map<string, any[]>();
    for (const pet of allPets) {
      const key = pet.clientId || 'sin_cliente';
      if (!petsByClient.has(key)) petsByClient.set(key, []);
      petsByClient.get(key)!.push(pet);
    }

    const resultClients: any[] = [];

    for (const client of allClients) {
      const name = (client.name || '').toLowerCase();
      const email = (client.email || '').toLowerCase();
      const phone = normalizePhone(client.phone || '');

      const clientMatchedBy: string[] = [];
      if (name.includes(term)) clientMatchedBy.push('cliente');
      if (email.includes(term)) clientMatchedBy.push('email');
      if (normalizedTermPhone && phone.includes(normalizedTermPhone)) clientMatchedBy.push('telefono');

      const clientPets = petsByClient.get(client.id) || [];

      const petsWithMatch = clientPets.map((pet) => {
        const matchedBy = [...clientMatchedBy];
        if ((pet.name || '').toLowerCase().includes(term)) matchedBy.push('mascota');
        return {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          lastVisit: pet.lastVisit,
          matchedBy,
        };
      });

      const anyPetNameMatch = petsWithMatch.some((p) => p.matchedBy.includes('mascota'));
      const clientMatched = clientMatchedBy.length > 0;

      // Se incluye el cliente (con TODAS sus mascotas, para dar contexto completo)
      // si el cliente coincidió directamente, o si alguna de sus mascotas coincidió por nombre.
      if (clientMatched || anyPetNameMatch) {
        resultClients.push({
          id: client.id,
          owner: client.name,
          ownerPhone: client.phone || '',
          email: client.email || '',
          address: client.address || '',
          pets: petsWithMatch,
        });
      }
    }

    const totalPets = resultClients.reduce((acc, c) => acc + c.pets.length, 0);

    res.status(200).json({
      query: term,
      totalClients: resultClients.length,
      totalPets,
      clients: resultClients,
    });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ message: 'Error al realizar la búsqueda', error: (error as Error).message });
  }
};