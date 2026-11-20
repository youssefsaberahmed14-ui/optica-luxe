import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/optica_luxe?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'optica_luxe_super_secure_jwt_secret_key_2026_zentrix',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '20', 10),
  adminDefault: {
    email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@optica-luxe.com',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456',
    name: process.env.ADMIN_DEFAULT_NAME || 'Zentrix Administrator',
  },
};
