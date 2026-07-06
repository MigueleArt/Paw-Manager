import { Router } from 'express';
import {
  getPets,
  createPet,
  updatePet,
  deletePet,
  getPetNotes,
  addPetNote,
} from '../controllers/pets.controller';
import { requireAuth } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import {
  createPetNoteSchema,
  createPetSchema,
  updatePetSchema,
} from '../validators/pet.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', getPets);
router.post('/', validateBody(createPetSchema), createPet);
router.put('/:id', validateBody(updatePetSchema), updatePet);
router.delete('/:id', deletePet);

router.get('/:id/notes', getPetNotes);
router.post('/:id/notes', validateBody(createPetNoteSchema), addPetNote);

export default router;
