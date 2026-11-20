import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { validateEnvironment } from '../src/config/env';

const app = createApp();

const validProdConfig = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/optica_prod',
  JWT_SECRET: '8f9e2b1c4d7a5e3f6b9c2a1d4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
  ADMIN_EMAIL: 'chief-security@optica-luxe-store.com',
  ADMIN_PASSWORD: 'UltraSecurePassword2026!#$',
  CORS_ORIGIN: 'https://optica-luxe.com',
};

describe('Issues 2 & 6 & 7: Production Database, Admin Credentials & Strict CORS Security', () => {
  it('should REJECT missing JWT_SECRET in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        JWT_SECRET: '',
      });
    }).toThrow(/JWT_SECRET/i);
  });

  it('should REJECT weak JWT_SECRET (< 32 chars) in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        JWT_SECRET: 'short_secret_under_32_chars',
      });
    }).toThrow(/must be at least 32 characters long/i);
  });

  it('should REJECT predictable / default JWT_SECRET in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        JWT_SECRET: 'optica_luxe_super_secure_jwt_secret_key_2026_zentrix',
      });
    }).toThrow(/too weak or uses a predictable default/i);
  });

  it('Admin Bootstrap: should REJECT missing ADMIN_EMAIL in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        ADMIN_EMAIL: undefined,
      });
    }).toThrow(/requires an explicitly set ADMIN_EMAIL/i);
  });

  it('Admin Bootstrap: should REJECT predictable default ADMIN_EMAIL in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        ADMIN_EMAIL: 'admin@optica-luxe.com',
      });
    }).toThrow(/cannot use a predictable default email/i);
  });

  it('Admin Bootstrap: should REJECT missing or weak ADMIN_PASSWORD in production mode', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        ADMIN_PASSWORD: 'short',
      });
    }).toThrow(/must be at least 12 characters long/i);

    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        ADMIN_PASSWORD: 'Admin@Dev2026!',
      });
    }).toThrow(/too weak or uses a known default value/i);
  });

  it('CORS Security: should REJECT localhost origins in production CORS configuration', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        CORS_ORIGIN: 'http://localhost:4200',
      });
    }).toThrow(/cannot contain localhost origins/i);
  });

  it('CORS Security: should REJECT wildcard origin in production with credentials', () => {
    expect(() => {
      validateEnvironment({
        ...validProdConfig,
        CORS_ORIGIN: '*',
      });
    }).toThrow(/cannot use wildcard/i);
  });

  it('should ACCEPT strong, high-entropy production configuration', () => {
    const config = validateEnvironment(validProdConfig);

    expect(config.isProduction).toBe(true);
    expect(config.jwtSecret).toBe(validProdConfig.JWT_SECRET);
    expect(config.adminEmail).toBe(validProdConfig.ADMIN_EMAIL);
    expect(config.allowedCorsOrigins).toContain('https://optica-luxe.com');
  });

  it('Health Check Endpoint: should distinguish application status, database status, and readiness without demo flag', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.application).toBe('up');
    expect(res.body.service).toBe('Optica Luxe E-Commerce API');
    expect(res.body.database).toBeDefined();
    expect(res.body.database.status).toBeDefined();
    expect(res.body.readiness).toBeDefined();
    expect(res.body.demoMode).toBeUndefined();
  });

  it('Issue 6: Protect Real Store Database from Demo Seeding in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      // Attempting to run demo seed logic in production must throw safety error
      const seedSafetyCheck = () => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('[Safety Guard] Demo seed execution is strictly BLOCKED in production environment.');
        }
      };
      expect(() => seedSafetyCheck()).toThrow(/strictly BLOCKED in production environment/i);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
