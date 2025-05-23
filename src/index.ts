import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@config/config';
import { logger } from '@utils/logger';
import { errorHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/requestLogger';
import { DatabaseConnection } from '@database/connection';
import { RedisConnection } from '@database/redis';
import { routes } from '@routes/index';

class Application {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      });
    });
  }

  private initializeRoutes(): void {
    this.app.use(`/api/${config.apiVersion}`, routes);
    
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.initialize();
      logger.info('Database connection established');

      // Initialize Redis connection
      await RedisConnection.initialize();
      logger.info('Redis connection established');

      // Start server
      this.server = this.app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
        logger.info(`API Documentation: http://localhost:${config.port}/api/${config.apiVersion}/docs`);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
      process.on('uncaughtException', this.handleUncaughtException.bind(this));

    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    try {
      // Close database connections
      await DatabaseConnection.close();
      logger.info('Database connections closed');

      // Close Redis connection
      await RedisConnection.close();
      logger.info('Redis connection closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  private handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to restart the process
    if (config.nodeEnv === 'production') {
      this.gracefulShutdown('UNHANDLED_REJECTION');
    }
  }

  private handleUncaughtException(error: Error): void {
    logger.error('Uncaught Exception:', error);
    // In production, you should restart the process
    if (config.nodeEnv === 'production') {
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    }
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export { Application }; 