import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError
      ? error.message
      : 'Ocurrió un error interno en el servidor.';
  const details = error instanceof AppError ? error.details : undefined;

  if (statusCode >= 500) {
    console.error('[Backend error]', error);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details !== undefined ? { details } : {}),
  });
};
