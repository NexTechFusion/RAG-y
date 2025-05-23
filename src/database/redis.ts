import { createClient, RedisClientType } from 'redis';
import { logger } from '@utils/logger';
import { config } from '@config/config';

export class RedisConnection {
  private static client: RedisClientType;
  private static isInitialized = false;

  public static async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Redis already initialized');
      return;
    }

    const redisUrl = config.redis.password
      ? `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}/${config.redis.db}`
      : `redis://${config.redis.host}:${config.redis.port}/${config.redis.db}`;

    this.client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
      },
    });

    // Error handling
    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
    });

    try {
      await this.client.connect();
      this.isInitialized = true;
      logger.info('Redis connection established successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public static async get(key: string): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.get(key);
  }

  public static async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number }
  ): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    
    // Use the proper Redis v4 API - spread the options into the method call
    if (options) {
      return this.client.setEx(key, options.EX || options.PX || 3600, value);
    } else {
      return this.client.set(key, value);
    }
  }

  public static async del(key: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.del(key);
  }

  public static async exists(key: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.exists(key);
  }

  public static async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.hSet(key, field, value);
  }

  public static async hget(key: string, field: string): Promise<string | undefined> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.hGet(key, field);
  }

  public static async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.hGetAll(key);
  }

  public static async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.expire(key, seconds);
  }

  public static async ttl(key: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.ttl(key);
  }

  public static async flushall(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client.flushAll();
  }

  public static async close(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.isInitialized = false;
      logger.info('Redis connection closed');
    }
  }

  public static get isConnected(): boolean {
    return this.isInitialized && this.client?.isOpen;
  }

  public static getClient(): RedisClientType {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.client;
  }
} 