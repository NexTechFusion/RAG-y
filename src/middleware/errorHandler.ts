import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import { AppError, ValidationError } from '@utils/AppError';

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  error?: string;
  stack?: string;
  timestamp: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Handle specific error types
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    errorResponse.errors = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  } else if (err.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Update message in response
  errorResponse.message = message;

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.message;
    if (err.stack) {
      errorResponse.stack = err.stack;
    }
  }

  res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 