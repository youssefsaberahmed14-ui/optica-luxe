import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { validateEnvironment } from '../src/config/env';
import { initializeDatabase } from '../src/database/prisma';

const app = createApp();

describe('Issues 2 & 6: Production Database Enforcement & Environment Security', () => {
  it('should REJECT missing JWT_SECRET in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/optica_prod',
        JWT_SECRET: '',
      });
    }).toThrow(/JWT_SECRET/i);
  });

  it('should REJECT weak JWT_SECRET (< 32 chars) in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/optica_prod',
        JWT_SECRET: 'short_secret_under_32_chars',
      });
    }).toThrow(/must be at least 32 characters long/i);
  });

  it('should REJECT predictable / default JWT_SECRET in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/optica_prod',
        JWT_SECRET: 'optica_luxe_super_secure_jwt_secret_key_2026_zentrix',
      });
    }).toThrow(/too weak or uses a predictable default/i);
  });

  it('should ACCEPT strong, high-entropy JWT_SECRET in production mode', () => {
    const strongSecret = '8f9e2b1c4d7a5e3f6b9c2a1d4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f';
    const config = validateEnvironment({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/optica_prod',
      JWT_SECRET: strongSecret,
    });

    expect(config.isProduction).toBe(true);
    expect(config.jwtSecret).toBe(strongSecret);
  });

  it('Health Check Endpoint: should distinguish application status, database status, and readiness', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.application).toBe('up');
    expect(res.body.service).toBe('Optica Luxe E-Commerce API');
    expect(res.body.database).toBeDefined();
    expect(res.body.database.status).toBeDefined();
    expect(res.body.readiness).toBeDefined();
  });
});
