import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    params: req.params,
    query: req.query,
    // Only log body for non-sensitive routes
    body: req.url.includes('/auth/') ? '[REDACTED]' : req.body,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
}; 