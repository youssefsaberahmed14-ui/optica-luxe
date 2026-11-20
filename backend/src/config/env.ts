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

const PREDICTABLE_ADMIN_EMAILS = new Set([
  'admin@optica-luxe.com',
  'admin@example.com',
  'admin@admin.com',
  'admin@gmail.com',
  'test@test.com',
  'administrator@optica-luxe.com',
]);

const WEAK_PASSWORDS = new Set([
  'admin',
  'password',
  'admin123',
  '12345678',
  '123456789',
  'Admin@Dev2026!',
  'optica2026',
]);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TEST_DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((v) => parseInt(v, 10)),
  RATE_LIMIT_MAX_ATTEMPTS: z.string().default('60').transform((v) => parseInt(v, 10)),
  // Admin credentials
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
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
    // 1. JWT Secret Validation
    if (!source.JWT_SECRET) {
      throw new Error('[Security Error] Production requires an explicitly set JWT_SECRET.');
    }

    if (data.JWT_SECRET.length < 32) {
      throw new Error('[Security Error] Production JWT_SECRET must be at least 32 characters long.');
    }

    if (WEAK_SECRETS.has(data.JWT_SECRET.toLowerCase())) {
      throw new Error('[Security Error] Production JWT_SECRET is too weak or uses a predictable default value.');
    }

    // 2. Database URL Validation
    if (!data.DATABASE_URL.startsWith('postgres://') && !data.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('[Configuration Error] Production DATABASE_URL must be a valid PostgreSQL connection string.');
    }

    // 3. Admin Credentials Validation in Production
    if (!data.ADMIN_EMAIL) {
      throw new Error('[Security Error] Production requires an explicitly set ADMIN_EMAIL for the primary administrator.');
    }

    if (PREDICTABLE_ADMIN_EMAILS.has(data.ADMIN_EMAIL.toLowerCase())) {
      throw new Error(`[Security Error] Production ADMIN_EMAIL cannot use a predictable default email like "${data.ADMIN_EMAIL}".`);
    }

    if (!data.ADMIN_PASSWORD) {
      throw new Error('[Security Error] Production requires an explicitly set ADMIN_PASSWORD.');
    }

    if (data.ADMIN_PASSWORD.length < 12) {
      throw new Error('[Security Error] Production ADMIN_PASSWORD must be at least 12 characters long.');
    }

    if (WEAK_PASSWORDS.has(data.ADMIN_PASSWORD)) {
      throw new Error('[Security Error] Production ADMIN_PASSWORD is too weak or uses a known default value.');
    }

    // 4. CORS Origins in Production:
    const originsString = data.CORS_ALLOWED_ORIGINS || data.CORS_ORIGIN;
    const origins = originsString.split(',').map((o) => o.trim().toLowerCase());
    for (const origin of origins) {
      if (origin === '*') {
        throw new Error('[Security Error] Production CORS allowlist cannot use wildcard "*" with credentialed requests.');
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        throw new Error(`[Security Error] Production CORS allowlist cannot contain localhost origins ("${origin}").`);
      }
    }
  }

  // Parse CORS Allowlist
  let allowedCorsOrigins: string[];
  if (data.CORS_ALLOWED_ORIGINS) {
    allowedCorsOrigins = data.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  } else if (data.NODE_ENV === 'production') {
    allowedCorsOrigins = [data.CORS_ORIGIN.trim()];
  } else {
    // Development / Test defaults
    allowedCorsOrigins = [
      data.CORS_ORIGIN.trim(),
      'http://localhost:4200',
      'http://127.0.0.1:4200',
    ];
  }

  return {
    port: data.PORT,
    nodeEnv: data.NODE_ENV,
    isProduction: data.NODE_ENV === 'production',
    isDevelopment: data.NODE_ENV === 'development',
    isTest: data.NODE_ENV === 'test',
    databaseUrl: data.DATABASE_URL,
    testDatabaseUrl: data.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL,
    jwtSecret: data.JWT_SECRET,
    jwtExpiresIn: data.JWT_EXPIRES_IN,
    corsOrigin: data.CORS_ORIGIN,
    allowedCorsOrigins,
    rateLimitWindowMs: data.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxAttempts: data.RATE_LIMIT_MAX_ATTEMPTS,
    adminEmail: data.ADMIN_EMAIL,
    adminPassword: data.ADMIN_PASSWORD,
    adminName: data.ADMIN_NAME,
  };
}

// Global cached config
export const env = validateEnvironment();
