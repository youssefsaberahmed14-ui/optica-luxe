import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { isolatedTestDb, seedIsolatedTestData } from '../src/database/prisma';
import jsonwebtoken from 'jsonwebtoken';

const app = createApp();

function getAdminToken(): string {
  return jsonwebtoken.sign(
    {
      id: 'usr-admin-test',
      email: 'admin@optica-luxe.com',
      name: 'Test Administrator',
      role: 'SUPERADMIN',
    },
    env.jwtSecret,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
}

describe('Issue 3 & 4: Concurrency Tests (Scenarios A & B)', () => {
  let adminToken: string;

  beforeEach(async () => {
    await seedIsolatedTestData();
    adminToken = getAdminToken();
  });

  it('Scenario A: Two concurrent customers purchasing the last available item (Stock=1) -> exactly ONE succeeds and final stock=0', async () => {
    const limitedProduct = isolatedTestDb.products.find((p) => p.id === 'opt-last-item')!;
    expect(limitedProduct.stock).toBe(1); // Starting stock is strictly 1

    // Simulate Customer A and Customer B sending orders simultaneously
    const customerA = request(app)
      .post('/api/orders')
      .send({
        customerName: 'العميل أ (المتسابق الأول)',
        phone: '01011111111',
        email: 'customerA@example.com',
        address: 'عنوان أ',
        city: 'القاهرة',
        items: [{ productId: 'opt-last-item', quantity: 1 }],
      });

    const customerB = request(app)
      .post('/api/orders')
      .send({
        customerName: 'العميل ب (المتسابق الثاني)',
        phone: '01022222222',
        email: 'customerB@example.com',
        address: 'عنوان ب',
        city: 'الجيزة',
        items: [{ productId: 'opt-last-item', quantity: 1 }],
      });

    // Execute concurrently
    const [resA, resB] = await Promise.all([customerA, customerB]);

    const statuses = [resA.status, resB.status];
    const successes = statuses.filter((s) => s === 201);
    const failures = statuses.filter((s) => s === 400);

    // Exactly one order must succeed (201) and exactly one must fail (400)
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    // Final stock must be exactly 0, never negative
    expect(limitedProduct.stock).toBe(0);
    expect(limitedProduct.stock).toBeGreaterThanOrEqual(0);
  });

  it('Scenario B: Simultaneous duplicate cancellation requests -> inventory restored exactly once (Stock increases by 2, not 4)', async () => {
    const prod = isolatedTestDb.products.find((p) => p.id === 'opt-003')!;
    const initialStock = prod.stock; // 5

    // Order 2 items
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'شريف عبد المنعم',
        phone: '01033333333',
        email: 'sherif.order@example.com',
        address: 'الرحاب',
        city: 'القاهرة',
        items: [{ productId: 'opt-003', quantity: 2 }],
      });

    const orderId = checkoutRes.body.data.orderNumber;
    expect(prod.stock).toBe(initialStock - 2); // 3

    // Fire two cancellation requests simultaneously
    const cancelReq1 = request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED', cancellationReason: 'Concurrent Cancel 1' });

    const cancelReq2 = request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED', cancellationReason: 'Concurrent Cancel 2' });

    const [cancelRes1, cancelRes2] = await Promise.all([cancelReq1, cancelReq2]);

    // Stock must be restored by exactly 2 (back to initial 5), NEVER 7 (initial + 2 + 2)!
    expect(prod.stock).toBe(initialStock);
    expect(prod.stock).not.toBe(initialStock + 2);

    // At least one returned success
    const cancelStatuses = [cancelRes1.status, cancelRes2.status];
    expect(cancelStatuses.includes(200)).toBe(true);
  });

  it('Idempotency mechanism: Repeated checkout submission with same idempotency key prevents duplicate orders', async () => {
    const idempotencyKey = 'checkout_idemp_key_unique_12345';
    const prod = isolatedTestDb.products.find((p) => p.id === 'opt-001')!;
    const stockBefore = prod.stock;

    const payload = {
      customerName: 'مروان بابلو',
      phone: '01099887766',
      email: 'pablo@example.com',
      address: 'الإسكندرية',
      city: 'الإسكندرية',
      items: [{ productId: 'opt-001', quantity: 1 }],
      idempotencyKey,
    };

    // First checkout submission
    const res1 = await request(app).post('/api/orders').send(payload);
    expect(res1.status).toBe(201);
    expect(res1.body.data.orderNumber).toBeDefined();
    const orderNumber1 = res1.body.data.orderNumber;
    expect(prod.stock).toBe(stockBefore - 1);

    // Repeated checkout submission with same idempotency key
    const res2 = await request(app).post('/api/orders').send(payload);
    expect(res2.status).toBe(200); // 200 OK returning existing order
    expect(res2.body.data.orderNumber).toBe(orderNumber1);

    // Stock must NOT have been deducted a second time
    expect(prod.stock).toBe(stockBefore - 1);
  });

  it('Idempotency violation: Reusing the same key with a DIFFERENT payload must be rejected with 409', async () => {
    const idempotencyKey = 'checkout_idemp_key_diff_payload_test';

    const initialPayload = {
      customerName: 'طارق حسام',
      phone: '01012345678',
      email: 'tarek.hossam@example.com',
      address: 'المعادي',
      city: 'القاهرة',
      items: [{ productId: 'opt-001', quantity: 1 }],
      idempotencyKey,
    };

    const res1 = await request(app).post('/api/orders').send(initialPayload);
    expect(res1.status).toBe(201);

    // Reuse key with different customer name
    const differentPayload = {
      ...initialPayload,
      customerName: 'شخص مختلف تماماً',
    };

    const res2 = await request(app).post('/api/orders').send(differentPayload);
    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
  });
});
