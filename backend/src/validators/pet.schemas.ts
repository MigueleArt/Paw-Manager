import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.'),
  species: z.string().trim().min(1, 'La especie es obligatoria.'),
  breed: z.string().trim().min(1, 'La raza es obligatoria.'),
  age: z.coerce
    .number()
    .int('La edad debe ser un número entero.')
    .min(0, 'La edad no puede ser negativa.')
    .max(100, 'La edad no es válida.'),
  owner: z.string().trim().min(1, 'El propietario es obligatorio.'),
  clinicId: z.string().trim().min(1, 'El clinicId no es válido.').optional(),
});

export const updatePetSchema = createPetSchema
  .omit({ clinicId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar.',
  });

export const createPetNoteSchema = z.object({
  text: z.string().trim().min(1, 'La nota no puede estar vacía.'),
  doctor: z.string().trim().min(1, 'El doctor no es válido.').optional(),
  clinicId: z.string().trim().min(1, 'El clinicId no es válido.').optional(),
});
