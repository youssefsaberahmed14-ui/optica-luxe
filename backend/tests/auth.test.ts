import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { initializeDatabase } from '../src/database/prisma';

const app = createApp();

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: env.adminDefault.email,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid admin credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: env.adminDefault.email,
      password: env.adminDefault.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(env.adminDefault.email.toLowerCase());
  });

  it('should reject access to profile without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('should allow access to profile with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: env.adminDefault.email,
      password: env.adminDefault.password,
    });

    const token = loginRes.body.data.token;

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe(env.adminDefault.email.toLowerCase());
  });
});
