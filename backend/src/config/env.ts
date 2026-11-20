import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const WEAK_SECRETS = new Set([
  'secret',
  'jwtsecret',
  'password',
  '123456',
  '12345678',
  'changeme',
  'default',
  'optica_luxe_secret',
  'optica_luxe_super_secure_jwt_secret_key_2026_zentrix',
]);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_ATTEMPTS: z.string().default('20').transform((v) => parseInt(v, 10)),
  // Production admin account should be configured explicitly via secure admin setup, not seeded with defaults
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(10).optional(),
  ADMIN_NAME: z.string().optional(),
});

export function validateEnvironment(overrideEnv?: Record<string, string | undefined>) {
  const source = overrideEnv || process.env;
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`[Configuration Error] Invalid environment variables: ${issues}`);
  }

  const data = parsed.data;

  // Strict Production Validations
  if (data.NODE_ENV === 'production') {
    if (!source.JWT_SECRET) {
      throw new Error('[Security Error] Production requires an explicitly set JWT_SECRET.');
    }

    if (data.JWT_SECRET.length < 32) {
      throw new Error('[Security Error] Production JWT_SECRET must be at least 32 characters long.');
    }

    if (WEAK_SECRETS.has(data.JWT_SECRET.toLowerCase())) {
      throw new Error('[Security Error] Production JWT_SECRET is too weak or uses a predictable default value.');
    }

    if (!data.DATABASE_URL.startsWith('postgres://') && !data.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('[Configuration Error] Production DATABASE_URL must be a valid PostgreSQL connection string.');
    }
  }

  return {
    port: data.PORT,
    nodeEnv: data.NODE_ENV,
    isProduction: data.NODE_ENV === 'production',
    isTest: data.NODE_ENV === 'test',
    databaseUrl: data.DATABASE_URL,
    jwtSecret: data.JWT_SECRET,
    jwtExpiresIn: data.JWT_EXPIRES_IN,
    corsOrigin: data.CORS_ORIGIN,
    rateLimitWindowMs: data.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxAttempts: data.RATE_LIMIT_MAX_ATTEMPTS,
    adminEmail: data.ADMIN_EMAIL,
    adminPassword: data.ADMIN_PASSWORD,
    adminName: data.ADMIN_NAME,
  };
}

// Global cached config
export const env = validateEnvironment();
