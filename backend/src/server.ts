import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import petsRoutes from './routes/pets.routes';
import searchRoutes from './routes/search.routes';
import clientsRoutes from './routes/clients.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Paw-Manager Backend API is running!');
});

app.use('/api/pets', petsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/clients', clientsRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});