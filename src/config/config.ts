import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)).default('3000'),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5432'),
  DB_NAME: z.string().default('ai_chat_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().min(1),
  DB_SSL: z.string().transform(val => val === 'true').default('false'),
  DB_MAX_CONNECTIONS: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).pipe(z.number().min(0).max(15)).default('0'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // File Upload
  UPLOAD_MAX_SIZE: z.string().transform(Number).pipe(z.number().min(1)).default('10485760'),
  UPLOAD_ALLOWED_TYPES: z.string().default('pdf,doc,docx,txt,md,png,jpg,jpeg,gif'),
  UPLOAD_DESTINATION: z.string().default('uploads/'),
  
  // AI Models
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(15)).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().min(1000)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().min(1)).default('10000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
};

const env = validateEnv();

// Export typed configuration
export const config = {
  nodeEnv: env.NODE_ENV,
  port: Number(env.PORT),
  apiVersion: env.API_VERSION,
  
  database: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL,
    maxConnections: Number(env.DB_MAX_CONNECTIONS),
  },
  
  redis: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
    password: env.REDIS_PASSWORD,
    db: Number(env.REDIS_DB),
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  upload: {
    maxSize: Number(env.UPLOAD_MAX_SIZE),
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
    destination: env.UPLOAD_DESTINATION,
  },
  
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      orgId: env.OPENAI_ORG_ID,
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
    },
    google: {
      apiKey: env.GOOGLE_AI_API_KEY,
    },
  },
  
  security: {
    bcryptRounds: Number(env.BCRYPT_ROUNDS),
  },
  
  rateLimit: {
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
    maxRequests: Number(env.RATE_LIMIT_MAX_REQUESTS),
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM,
  },
} as const;

export type Config = typeof config; 