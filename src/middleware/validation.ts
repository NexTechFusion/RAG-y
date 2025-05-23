import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@utils/AppError';
import { logger } from '@utils/logger';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log what we're about to validate
      logger.debug('Validating request:', {
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Validate request body, query, and params
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = schema.safeParse(validationData);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => {
          const fieldPath = error.path.join('.');
          
          // Safely get the received value
          let received: any = validationData;
          for (const key of error.path) {
            if (received && typeof received === 'object' && key in received) {
              received = received[key as keyof typeof received];
            } else {
              received = undefined;
              break;
            }
          }
          
          return {
            field: fieldPath,
            message: error.message,
            received: received,
            code: error.code,
          };
        });

        // Enhanced logging with more details
        logger.warn('Validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
          receivedData: {
            body: req.body,
            query: req.query,
            params: req.params,
          },
          zodErrors: result.error.errors, // Raw Zod errors for debugging
        });

        // Create detailed error message
        const detailedMessage = `Validation failed for ${req.method} ${req.url}. Errors: ${
          errorMessages.map(err => `${err.field}: ${err.message} (received: ${JSON.stringify(err.received)})`).join(', ')
        }`;

        throw new ValidationError(detailedMessage, errorMessages.map(err => ({
          field: err.field,
          message: `${err.message} (received: ${JSON.stringify(err.received)})`
        })));
      }

      // Replace request data with validated data
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      logger.debug('Validation successful:', {
        url: req.url,
        method: req.method,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.error('Zod validation error:', {
          url: req.url,
          method: req.method,
          zodError: error,
          formattedErrors: errorMessages,
        });

        return next(new ValidationError('Zod validation failed', errorMessages));
      }

      logger.error('Unexpected validation error:', {
        url: req.url,
        method: req.method,
        error: error,
      });

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