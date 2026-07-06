import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from './errorMiddleware';

export function validateBody(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          'Los datos enviados no son válidos.',
          400,
          result.error.issues.map((issue) => ({
            field: issue.path.join('.') || 'body',
            message: issue.message,
          }))
        )
      );
      return;
    }

    req.body = result.data;
    next();
  };
}
