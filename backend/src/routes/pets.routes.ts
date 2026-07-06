import { Router } from 'express';
import {
  getPets,
  createPet,
  updatePet,
  deletePet,
  getPetNotes,
  addPetNote,
} from '../controllers/pets.controller';

const router = Router();

router.get('/', getPets);
router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

router.get('/:id/notes', getPetNotes);
router.post('/:id/notes', addPetNote);

export default router;