import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { isolatedTestDb, seedIsolatedTestData, TEST_UUIDS } from '../src/database/prisma';

const app = createApp();

describe('Order Creation, Idempotency & Authoritative Pricing API', () => {
  beforeEach(async () => {
    await seedIsolatedTestData();
  });

  it('should reject order creation with empty cart', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمد أحمد',
      phone: '01012345678',
      email: 'mohamed@example.com',
      address: 'القاهرة، المعادي',
      city: 'القاهرة',
      items: [],
      idempotencyKey: 'opt_idemp_key_valid_123456',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject order creation when idempotencyKey is missing', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمد أحمد',
      phone: '01012345678',
      email: 'mohamed@example.com',
      address: 'القاهرة، المعادي',
      city: 'القاهرة',
      items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
      // Missing idempotencyKey
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/Idempotency Key/i);
  });

  it('should reject order creation when idempotencyKey is shorter than 16 characters', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمد أحمد',
      phone: '01012345678',
      email: 'mohamed@example.com',
      address: 'القاهرة، المعادي',
      city: 'القاهرة',
      items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
      idempotencyKey: 'short_key', // Less than 16 chars
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/16/);
  });

  it('should reject order creation with invalid product ID', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمد أحمد',
      phone: '01012345678',
      email: 'mohamed@example.com',
      address: 'القاهرة، المعادي',
      city: 'القاهرة',
      items: [
        {
          productId: 'non-existent-product-id',
          quantity: 1,
        },
      ],
      idempotencyKey: 'opt_idemp_key_valid_999999',
    });

    expect(res.status).toBe(400);
  });

  it('should reject order when requested quantity exceeds available stock', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمود عبد العزيز',
      phone: '01055556666',
      email: 'mahmoud@example.com',
      address: 'الإسكندرية',
      city: 'الإسكندرية',
      items: [
        {
          productId: TEST_UUIDS.lindberg, // Lindberg with only 5 in stock
          quantity: 100, // Exceeds 5
        },
      ],
      idempotencyKey: 'opt_idemp_key_valid_888888',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('غير متوفرة في المخزون');
  });

  it('should create order with COD defaults, calculate authoritative server prices, and apply valid coupons', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'فؤاد المهندس',
      phone: '01099998888',
      email: 'fouad@example.com',
      address: 'شارع الهرم، الجيزة',
      city: 'الجيزة',
      items: [
        {
          productId: TEST_UUIDS.tomFord, // Tom Ford (1950 EGP)
          quantity: 1,
          selectedColor: 'هافانا داكن',
        },
      ],
      couponCode: 'LUXE2026', // 15% discount
      paymentMethod: 'COD',
      idempotencyKey: 'opt_idemp_key_valid_777777',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.data;

    expect(order.orderNumber).toBeDefined();
    expect(order.orderNumber).toMatch(/^OPT-\d{4}-\d{4}-\d+$/);
    expect(order.paymentMethod).toBe('COD');
    expect(order.paymentStatus).toBe('UNPAID');
    expect(order.orderStatus).toBe('PENDING');

    // Authoritative Server Calculations:
    // Subtotal: 1950
    // Discount 15%: 1950 * 0.15 = 292.5
    // Shipping: 75 EGP (subtotal < 2000)
    // Total: 1950 - 292.5 + 75 = 1732.5
    expect(order.subtotal).toBe(1950);
    expect(order.discount).toBe(292.5);
    expect(order.shipping).toBe(75);
    expect(order.total).toBe(1732.5);
  });

  it('should apply free shipping when subtotal >= 2000 EGP', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'كريم عبد العزيز',
      phone: '01012345678',
      email: 'karim@example.com',
      address: 'القاهرة، التجمع الخامس',
      city: 'القاهرة',
      items: [
        {
          productId: TEST_UUIDS.cartier, // Cartier (3200 EGP >= 2000)
          quantity: 1,
        },
      ],
      paymentMethod: 'COD',
      idempotencyKey: 'opt_idemp_key_freeship_001',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.subtotal).toBe(3200);
    expect(res.body.data.shipping).toBe(0);
    expect(res.body.data.total).toBe(3200);
  });

  it('should reject expired coupon and coupon that reached max uses', async () => {
    // Add an expired coupon
    isolatedTestDb.coupons.push({
      id: 'coupon-expired-uuid',
      code: 'EXPIRED10',
      discountPercent: 10,
      maxUses: 100,
      usedCount: 0,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      expiresAt: new Date(Date.now() - 86400000), // yesterday
      isActive: true,
      createdAt: new Date(),
    });

    // Add a max-uses reached coupon
    isolatedTestDb.coupons.push({
      id: 'coupon-exhausted-uuid',
      code: 'MAXEDOUT',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 5,
      usageCount: 5,
      expiresAt: new Date(Date.now() + 86400000),
      isActive: true,
      createdAt: new Date(),
    });

    const resExpired = await request(app).post('/api/orders').send({
      customerName: 'ياسر جلال',
      phone: '01012345678',
      email: 'yasser@example.com',
      address: 'مدينة نصر',
      city: 'القاهرة',
      items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
      couponCode: 'EXPIRED10',
      idempotencyKey: 'opt_idemp_key_expired_coupon',
    });
    expect(resExpired.status).toBe(400);
    expect(resExpired.body.message).toContain('منتهي الصلاحية');

    const resMaxed = await request(app).post('/api/orders').send({
      customerName: 'ياسر جلال',
      phone: '01012345678',
      email: 'yasser@example.com',
      address: 'مدينة نصر',
      city: 'القاهرة',
      items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
      couponCode: 'MAXEDOUT',
      idempotencyKey: 'opt_idemp_key_maxed_coupon',
    });
    expect(resMaxed.status).toBe(400);
    expect(resMaxed.body.message).toContain('استنفاد');
  });

  it('should support safe idempotent retries returning 200 with raw tracking token', async () => {
    const payload = {
      customerName: 'سامح حسين',
      phone: '01088887777',
      email: 'sameh@example.com',
      address: 'المعادي، القاهرة',
      city: 'القاهرة',
      items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
      paymentMethod: 'COD',
      idempotencyKey: 'opt_idemp_key_retry_test_9999',
    };

    // First request
    const firstRes = await request(app).post('/api/orders').send(payload);
    expect(firstRes.status).toBe(201);
    expect(firstRes.body.data.trackingToken).toBeDefined();
    const originalToken = firstRes.body.data.trackingToken;

    // Retry request with identical idempotencyKey and identical payload
    const retryRes = await request(app).post('/api/orders').send(payload);
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.orderNumber).toBe(firstRes.body.data.orderNumber);
    expect(retryRes.body.data.trackingToken).toBe(originalToken);

    // Mismatched payload retry should return 409 Conflict
    const mismatchedRes = await request(app).post('/api/orders').send({
      ...payload,
      customerName: 'شخص آخر مختلف',
    });
    expect(mismatchedRes.status).toBe(409);
    expect(mismatchedRes.body.message).toContain('Idempotency Key');
  });

  it('should persist prescription details and lens options securely', async () => {
    const prescriptionPayload = {
      rightEyeOD: { sphere: -2.5, cylinder: -0.75, axis: 90 },
      leftEyeOS: { sphere: -2.0, cylinder: -0.5, axis: 85 },
      pupillaryDistancePD: 63,
    };

    const res = await request(app).post('/api/orders').send({
      customerName: 'داليا البحيري',
      phone: '01066667777',
      email: 'dalia@example.com',
      address: 'الزمالك، القاهرة',
      city: 'القاهرة',
      items: [
        {
          productId: TEST_UUIDS.cartier,
          quantity: 1,
          selectedColor: 'ذهبي كلاسيكي',
          lensOption: 'عدسات طبية مضادة للانعكاس Blue Block',
          prescription: prescriptionPayload,
        },
      ],
      paymentMethod: 'COD',
      idempotencyKey: 'opt_idemp_key_prescription_001',
    });

    expect(res.status).toBe(201);
    const trackingToken = res.body.data.trackingToken;

    // Verify public tracking does NOT expose prescription or medical privacy details
    const trackRes = await request(app)
      .get(`/api/orders/track/${res.body.data.orderNumber}`)
      .set('X-Tracking-Token', trackingToken);

    expect(trackRes.status).toBe(200);
    expect(trackRes.body.data.prescription).toBeUndefined();
    expect(trackRes.body.data.address).toBeUndefined();
    expect(trackRes.body.data.email).toBeUndefined();
  });
});
