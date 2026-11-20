import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { initializeDatabase } from '../src/database/prisma';

const app = createApp();

describe('Products & Coupons API', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it('should fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should filter products by category', async () => {
    const res = await request(app).get('/api/products?category=sunglasses');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.category === 'sunglasses')).toBe(true);
  });

  it('should validate active coupon code LUXE2026', async () => {
    const res = await request(app).get('/api/coupons/validate/LUXE2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountValue).toBe(15);
  });

  it('should reject invalid coupon code', async () => {
    const res = await request(app).get('/api/coupons/validate/NON_EXISTENT_CODE');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
