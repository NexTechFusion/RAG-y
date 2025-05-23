import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@utils/AppError';
import { logger } from '@utils/logger';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, and params
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = schema.safeParse(validationData);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));

        logger.warn('Validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
        });

        throw new ValidationError('Validation failed', errorMessages);
      }

      // Replace request data with validated data
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return next(new ValidationError('Validation failed', errorMessages));
      }

      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));

        logger.warn('Body validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
        });

        throw new ValidationError('Validation failed', errorMessages);
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));

        throw new ValidationError('Query validation failed', errorMessages);
      }

      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => ({
          field: error.path.join('.'),
          message: error.message,
        }));

        throw new ValidationError('Params validation failed', errorMessages);
      }

      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}; 