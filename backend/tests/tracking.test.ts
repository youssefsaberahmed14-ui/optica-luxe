import crypto from 'crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { seedIsolatedTestData } from '../src/database/prisma';

const app = createApp();

describe('Issue 1 & 3: Secure Customer Order Tracking, Sanitized DTO & Header-Based Auth', () => {
  beforeEach(async () => {
    await seedIsolatedTestData();
  });

  it('Sanitized DTO: should return raw tracking token only once and NEVER expose DB IDs, token hash or customer PII in checkout response', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'طارق نور',
        phone: '01011223344',
        email: 'tarek@example.com',
        address: 'شارع الثورة، مصر الجديدة، شقة 12',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();

    // Raw tracking token is returned in the root response only once
    expect(res.body.trackingToken).toBeDefined();
    expect(typeof res.body.trackingToken).toBe('string');
    expect(res.body.trackingToken.length).toBe(64); // 32 bytes hex = 64 characters

    // Critical Security Assertions: Data DTO must NOT expose internal DB IDs, customer PII, or token hash
    expect(res.body.data.id).toBeUndefined();
    expect(res.body.data.trackingTokenHash).toBeUndefined();
    expect(res.body.data.customerName).toBeUndefined();
    expect(res.body.data.phone).toBeUndefined();
    expect(res.body.data.email).toBeUndefined();
    expect(res.body.data.address).toBeUndefined();

    // Verify order item in DTO does not leak internal DB IDs
    expect(res.body.data.items[0].id).toBeUndefined();
    expect(res.body.data.items[0].orderId).toBeUndefined();
    expect(res.body.data.items[0].productId).toBeUndefined();
  });

  it('Header-Based Tracking: should allow tracking using X-Tracking-Token header', async () => {
    // 1. Place order
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'كريم عبد العزيز',
        phone: '01122334455',
        email: 'karim@example.com',
        address: 'حي الدقي، الجيزة',
        city: 'الجيزة',
        items: [{ productId: 'opt-002', quantity: 1 }],
      });

    const orderNumber = checkoutRes.body.data.orderNumber;
    const trackingToken = checkoutRes.body.trackingToken;

    // 2. Track with X-Tracking-Token header
    const trackRes = await request(app)
      .get(`/api/orders/track/${orderNumber}`)
      .set('X-Tracking-Token', trackingToken);

    expect(trackRes.status).toBe(200);
    expect(trackRes.body.success).toBe(true);
    const data = trackRes.body.data;

    expect(data.orderNumber).toBe(orderNumber);
    expect(data.orderStatus).toBe('PENDING');
    expect(data.paymentMethod).toBe('COD');
    expect(data.paymentStatus).toBe('UNPAID');
    expect(data.city).toBe('الجيزة');
    expect(data.estimatedDelivery).toBeDefined();
    expect(data.items.length).toBe(1);
    expect(data.items[0].productName).toBeDefined();
  });

  it('Security Enforcement: should strictly REJECT tracking tokens passed via URL query parameters', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'أحمد حلمي',
        phone: '01099887766',
        email: 'helmy@example.com',
        address: 'مدينة نصر',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    const orderNumber = checkoutRes.body.data.orderNumber;
    const trackingToken = checkoutRes.body.trackingToken;

    // Attempt tracking with query param ?token=...
    const rejectedRes = await request(app)
      .get(`/api/orders/track/${orderNumber}`)
      .query({ token: trackingToken });

    expect(rejectedRes.status).toBe(400);
    expect(rejectedRes.body.success).toBe(false);
    expect(rejectedRes.body.message).toMatch(/معلمات الرابط|X-Tracking-Token/i);
  });

  it('CUSTOMER PRIVACY: should NEVER expose full address, phone, email, internal IDs or tracking hash', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'سارة سلامة',
        phone: '01299887766',
        email: 'sara.private@example.com',
        address: 'الفيلا 44، كمبوند النرجس، التجمع الخامس، القاهرة الجديدة',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    const orderNumber = checkoutRes.body.data.orderNumber;
    const trackingToken = checkoutRes.body.trackingToken;

    const trackRes = await request(app)
      .get(`/api/orders/track/${orderNumber}`)
      .set('X-Tracking-Token', trackingToken);

    expect(trackRes.status).toBe(200);
    const data = trackRes.body.data;

    // Strict customer privacy assertions
    expect(data.address).toBeUndefined();
    expect(data.phone).toBeUndefined();
    expect(data.email).toBeUndefined();
    expect(data.id).toBeUndefined();
    expect(data.trackingTokenHash).toBeUndefined();
    expect(data.idempotencyKey).toBeUndefined();
    expect(data.notes).toBeUndefined();

    // Verify stringified response contains no private leaked snippets
    const bodyStr = JSON.stringify(trackRes.body);
    expect(bodyStr.includes('01299887766')).toBe(false);
    expect(bodyStr.includes('sara.private@example.com')).toBe(false);
    expect(bodyStr.includes('كمبوند النرجس')).toBe(false);
  });

  it('should reject tracking requests when guessing an order number without a valid token', async () => {
    // Attempt tracking without token header
    const resNoToken = await request(app).get('/api/orders/track/OPT-2026-00001');
    expect(resNoToken.status).toBe(400);

    // Attempt tracking with random guessed token in header
    const fakeToken = crypto.randomBytes(32).toString('hex');
    const resFakeToken = await request(app)
      .get('/api/orders/track/OPT-2026-00001')
      .set('X-Tracking-Token', fakeToken);

    expect(resFakeToken.status).toBe(404);
  });

  it('should reject a valid tracking token from Order A when used on Order B', async () => {
    // Create Order A
    const orderARes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'العميل أ',
        phone: '01011111111',
        email: 'clientA@example.com',
        address: 'شارع أ',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    // Create Order B
    const orderBRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'العميل ب',
        phone: '01022222222',
        email: 'clientB@example.com',
        address: 'شارع ب',
        city: 'الإسكندرية',
        items: [{ productId: 'opt-002', quantity: 1 }],
      });

    const tokenA = orderARes.body.trackingToken;
    const orderNumberB = orderBRes.body.data.orderNumber;

    // Use Token A to access Order B via header
    const crossAccessRes = await request(app)
      .get(`/api/orders/track/${orderNumberB}`)
      .set('X-Tracking-Token', tokenA);

    expect(crossAccessRes.status).toBe(401);
    expect(crossAccessRes.body.success).toBe(false);
  });

  it('should REJECT unauthenticated public access to complete order details via GET /api/orders/:id', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'مروان خوري',
        phone: '01055554444',
        email: 'marwan@example.com',
        address: 'شارع مصدق، الدقي',
        city: 'الجيزة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    const orderNumber = checkoutRes.body.data.orderNumber;

    // Direct public access to complete order record without admin JWT must be 401
    const publicAccessRes = await request(app).get(`/api/orders/${orderNumber}`);
    expect(publicAccessRes.status).toBe(401);
    expect(publicAccessRes.body.success).toBe(false);
  });
});
