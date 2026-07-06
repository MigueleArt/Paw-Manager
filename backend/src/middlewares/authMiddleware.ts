import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import admin from '../config/firebase';
import { AppError } from './errorMiddleware';

export interface AuthenticatedRequest extends Request {
  firebaseUser?: DecodedIdToken;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authorizationHeader = req.header('Authorization');

  if (!authorizationHeader?.startsWith('Bearer ')) {
    next(
      new AppError(
        'Token de autenticación requerido. Usa Authorization: Bearer <token>.',
        401
      )
    );
    return;
  }

  const token = authorizationHeader.substring(7).trim();

  if (!token) {
    next(new AppError('El token de autenticación está vacío.', 401));
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as AuthenticatedRequest).firebaseUser = decodedToken;
    next();
  } catch {
    next(new AppError('Token inválido, expirado o no autorizado.', 401));
  }
}
