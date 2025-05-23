import { Pool, PoolClient, PoolConfig } from 'pg';
import { logger } from '@utils/logger';
import { config } from '@config/config';

export class DatabaseConnection {
  private static pool: Pool;
  private static isInitialized = false;

  public static async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Database already initialized');
      return;
    }

    const poolConfig: PoolConfig = {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: config.database.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(poolConfig);

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established successfully');
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client:', err);
    });
  }

  public static async getClient(): Promise<PoolClient> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool.connect();
  }

  public static async query(text: string, params?: any[]): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      logger.error('Query failed:', { text, params, error });
      throw error;
    }
  }

  public static async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      logger.info('Database connection pool closed');
    }
  }

  public static get isConnected(): boolean {
    return this.isInitialized && !this.pool.ended;
  }

  public static getPoolInfo() {
    if (!this.pool) return null;
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
} 