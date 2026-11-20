import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { seedIsolatedTestData } from '../src/database/prisma';

const app = createApp();

describe('Auth API Endpoints & Security Controls', () => {
  beforeEach(async () => {
    await seedIsolatedTestData();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@optica-luxe.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid admin credentials and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@optica-luxe.com',
      password: 'Admin@TestPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@optica-luxe.com');
  });

  it('should reject access to protected profile without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('should allow access to profile with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@optica-luxe.com',
      password: 'Admin@TestPass123!',
    });

    const token = loginRes.body.data.token;

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe('admin@optica-luxe.com');
  });

  it('should reject invalid or forged JWT tokens', async () => {
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature';
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${forgedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
