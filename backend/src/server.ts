import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import petsRoutes from './routes/pets.routes';
import { requireAuth } from './middlewares/authMiddleware';
import type { AuthenticatedRequest } from './middlewares/authMiddleware';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/errorMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'success',
    message: 'Paw-Manager Backend API is running!',
  });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).firebaseUser;

  return res.status(200).json({
    status: 'success',
    message: 'Token validado correctamente.',
    data: {
      uid: user?.uid,
      email: user?.email ?? null,
      emailVerified: user?.email_verified ?? false,
    },
  });
});

app.use('/api/pets', petsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
