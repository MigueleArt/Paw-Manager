import { Request, Response } from 'express';
import { db } from '../config/firebase';

const petsCollection = db.collection('pets');

const normalizePhone = (value: string) => (value || '').replace(/[\s\-()]/g, '');

interface PetWithMatch {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  age?: string;
  owner?: string;
  ownerPhone?: string;
  lastVisit?: string;
  matchedBy: string[];
}

interface ClientGroup {
  owner: string;
  ownerPhone: string;
  pets: PetWithMatch[];
}

// GET /api/search?clinicId=xxxx&q=carlos
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { clinicId, q } = req.query;

    if (!clinicId) {
      return res.status(400).json({ message: 'clinicId es requerido' });
    }

    const term = ((q as string) || '').trim().toLowerCase();
    const normalizedTermPhone = normalizePhone(term);

    // Menos de 2 caracteres: no devolvemos resultados (evita traer todo el catálogo)
    if (term.length < 2) {
      return res.status(200).json({ query: term, totalClients: 0, totalPets: 0, clients: [] });
    }

    const snapshot = await petsCollection.where('clinicId', '==', clinicId).get();
    const allPets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    const matchedPets: PetWithMatch[] = [];

    for (const pet of allPets) {
      const matchedBy: string[] = [];

      const name = (pet.name || '').toLowerCase();
      const owner = (pet.owner || '').toLowerCase();
      const phone = normalizePhone(pet.ownerPhone || '');

      if (name.includes(term)) matchedBy.push('mascota');
      if (owner.includes(term)) matchedBy.push('cliente');
      if (normalizedTermPhone && phone.includes(normalizedTermPhone)) matchedBy.push('telefono');

      if (matchedBy.length > 0) {
        matchedPets.push({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          owner: pet.owner,
          ownerPhone: pet.ownerPhone || '',
          lastVisit: pet.lastVisit,
          matchedBy,
        });
      }
    }

    // Agrupar por cliente (dueño + teléfono)
    const clientsMap = new Map<string, ClientGroup>();
    for (const pet of matchedPets) {
      const key = `${(pet.owner || '').toLowerCase()}|${pet.ownerPhone || ''}`;
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          owner: pet.owner || 'Sin nombre registrado',
          ownerPhone: pet.ownerPhone || '',
          pets: [],
        });
      }
      clientsMap.get(key)!.pets.push(pet);
    }

    const clients = Array.from(clientsMap.values());

    res.status(200).json({
      query: term,
      totalClients: clients.length,
      totalPets: matchedPets.length,
      clients,
    });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ message: 'Error al realizar la búsqueda', error: (error as Error).message });
  }
};