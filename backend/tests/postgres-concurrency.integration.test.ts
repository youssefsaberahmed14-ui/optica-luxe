import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import jsonwebtoken from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { orderService } from '../src/services/order.service';

const testDbUrl = process.env.TEST_DATABASE_URL;

// Safety check function: Guarantees integration tests NEVER run against production databases
function verifyTestDatabaseSafety(url: string | undefined): boolean {
  if (!url) return false;

  const lowercase = url.toLowerCase();
  // Must be PostgreSQL
  if (!lowercase.startsWith('postgres://') && !lowercase.startsWith('postgresql://')) {
    throw new Error('[Safety Guard] TEST_DATABASE_URL must be a valid PostgreSQL connection string.');
  }

  // Must contain 'test' or 'isolated' in the database name
  const dbNameMatch = lowercase.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';

  if (!dbName.includes('test') && !dbName.includes('isolated')) {
    throw new Error(
      `[Safety Guard] Integration tests can ONLY run against databases containing 'test' or 'isolated' in their name (Found: "${dbName}"). Aborting to protect non-test data.`
    );
  }

  // Reject production keywords
  if (dbName.includes('prod') || dbName.includes('production')) {
    throw new Error('[Safety Guard] Fatal: Database name contains "prod". Execution aborted.');
  }

  return true;
}

const isLivePostgresAvailable = Boolean(testDbUrl && verifyTestDatabaseSafety(testDbUrl));

function getAdminToken(): string {
  return jsonwebtoken.sign(
    {
      id: 'usr-admin-pg-test',
      email: 'admin@optica-luxe.com',
      name: 'Postgres Integration Administrator',
      role: 'SUPERADMIN',
    },
    env.jwtSecret,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
}

describe.runIf(isLivePostgresAvailable)(
  'Issue 5: Real PostgreSQL Integration & Concurrency Tests via Production HTTP & Service Layer',
  () => {
    let testPrisma: PrismaClient;
    let app: ReturnType<typeof createApp>;
    let adminToken: string;

    beforeAll(async () => {
      testPrisma = new PrismaClient({
        datasources: { db: { url: testDbUrl } },
      });
      await testPrisma.$connect();
      app = createApp();
      adminToken = getAdminToken();
    });

    afterAll(async () => {
      await testPrisma.$disconnect();
    });

    it('Scenario 1: Two customers buying the last item (stock=1) concurrently via real HTTP API -> exactly ONE succeeds and stock=0', async () => {
      // 1. Seed product with stock = 1
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-REAL-CONC-01' },
        update: { stock: 1, price: new Decimal(3200) },
        create: {
          sku: 'PG-REAL-CONC-01',
          name: 'Real HTTP Concurrency Frame',
          price: new Decimal(3200),
          stock: 1,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      // 2. Fire 2 concurrent HTTP POST /api/orders requests using real application route
      const customerA = request(app)
        .post('/api/orders')
        .send({
          customerName: 'Customer A (Concurrent)',
          phone: '01011111111',
          email: 'custA@example.com',
          address: 'Cairo Address',
          city: 'Cairo',
          items: [{ productId: testProduct.id, quantity: 1 }],
          idempotencyKey: 'idemp_pg_real_conc_cust_a',
        });

      const customerB = request(app)
        .post('/api/orders')
        .send({
          customerName: 'Customer B (Concurrent)',
          phone: '01022222222',
          email: 'custB@example.com',
          address: 'Giza Address',
          city: 'Giza',
          items: [{ productId: testProduct.id, quantity: 1 }],
          idempotencyKey: 'idemp_pg_real_conc_cust_b',
        });

      const [resA, resB] = await Promise.all([customerA, customerB]);

      const statuses = [resA.status, resB.status];
      expect(statuses.includes(201)).toBe(true);
      expect(statuses.includes(400)).toBe(true);

      // Verify PostgreSQL stock is exactly 0, never negative
      const productInDb = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(productInDb!.stock).toBe(0);
    });

    it('Scenario 2: Concurrent cancellation requests via real HTTP API -> inventory restored exactly ONCE', async () => {
      // 1. Seed product with stock = 5
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-REAL-CANCEL-02' },
        update: { stock: 5, price: new Decimal(1800) },
        create: {
          sku: 'PG-REAL-CANCEL-02',
          name: 'Real HTTP Cancel Frame',
          price: new Decimal(1800),
          stock: 5,
          category: 'eyeglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      // 2. Create order for 2 items via real orderService
      const created = await orderService.createOrder({
        customerName: 'Cancel Test Customer',
        phone: '01033333333',
        email: 'cancel@example.com',
        address: 'Alex Address',
        city: 'Alexandria',
        items: [{ productId: testProduct.id, quantity: 2 }],
        idempotencyKey: 'idemp_pg_real_cancel_key',
      });

      const orderNumber = created.order.orderNumber;

      // 3. Fire two simultaneous HTTP cancellation requests via PATCH /api/orders/:id/status
      const cancel1 = request(app)
        .patch(`/api/orders/${orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderStatus: 'CANCELLED', cancellationReason: 'Concurrent Cancel 1' });

      const cancel2 = request(app)
        .patch(`/api/orders/${orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderStatus: 'CANCELLED', cancellationReason: 'Concurrent Cancel 2' });

      const [res1, res2] = await Promise.all([cancel1, cancel2]);

      // Stock in PostgreSQL must be restored by 2 (back to 5), NEVER 7 (3 + 2 + 2)
      const finalProduct = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct!.stock).toBe(5);

      const cancelStatuses = [res1.status, res2.status];
      expect(cancelStatuses.includes(200)).toBe(true);
    });

    it('Scenario 3: Concurrent Cash Collection requests via POST /api/orders/:id/collect-cash -> exactly ONE payment transition and audit record', async () => {
      // 1. Create order and advance to DELIVERED
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-REAL-CASH-03' },
        update: { stock: 10, price: new Decimal(2200) },
        create: {
          sku: 'PG-REAL-CASH-03',
          name: 'Real HTTP Cash Collect Frame',
          price: new Decimal(2200),
          stock: 10,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      const created = await orderService.createOrder({
        customerName: 'Cash Collect Customer',
        phone: '01055554444',
        email: 'cash@example.com',
        address: 'Zamalek',
        city: 'Cairo',
        items: [{ productId: testProduct.id, quantity: 1 }],
        idempotencyKey: 'idemp_pg_real_cash_order',
      });

      const orderNumber = created.order.orderNumber;

      // Move to DELIVERED
      await orderService.updateOrderStatus(orderNumber, { orderStatus: 'CONFIRMED' }, { email: 'admin@optica-luxe.com' });
      await orderService.updateOrderStatus(orderNumber, { orderStatus: 'PROCESSING' }, { email: 'admin@optica-luxe.com' });
      await orderService.updateOrderStatus(orderNumber, { orderStatus: 'SHIPPED' }, { email: 'admin@optica-luxe.com' });
      await orderService.updateOrderStatus(orderNumber, { orderStatus: 'DELIVERED' }, { email: 'admin@optica-luxe.com' });

      // 2. Fire 2 concurrent HTTP requests to POST /api/orders/:id/collect-cash
      const req1 = request(app)
        .post(`/api/orders/${orderNumber}/collect-cash`)
        .set('Authorization', `Bearer ${adminToken}`);

      const req2 = request(app)
        .post(`/api/orders/${orderNumber}/collect-cash`)
        .set('Authorization', `Bearer ${adminToken}`);

      const [res1, res2] = await Promise.all([req1, req2]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // Exactly ONE returned alreadyPaid === false
      const alreadyPaidValues = [res1.body.alreadyPaid, res2.body.alreadyPaid];
      expect(alreadyPaidValues.filter((v) => v === false).length).toBe(1);
      expect(alreadyPaidValues.filter((v) => v === true).length).toBe(1);

      // Verify PostgreSQL database state: exactly ONE cash collection history record
      const dbOrder = await testPrisma.order.findUnique({
        where: { orderNumber },
        include: { statusHistory: true },
      });
      expect(dbOrder!.paymentStatus).toBe('PAID');
      expect(dbOrder!.paidAt).toBeDefined();

      const cashHistory = dbOrder!.statusHistory.filter((h) =>
        h.notes?.includes('Cash on Delivery')
      );
      expect(cashHistory.length).toBe(1);
    });

    it('Scenario 4: Concurrent checkout with same idempotency key via real HTTP API -> single order, single stock deduction', async () => {
      const sharedKey = `idemp_pg_concurrent_shared_${Date.now()}`;

      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-REAL-IDEMP-04' },
        update: { stock: 15, price: new Decimal(1400) },
        create: {
          sku: 'PG-REAL-IDEMP-04',
          name: 'Real HTTP Idempotency Frame',
          price: new Decimal(1400),
          stock: 15,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      const payload = {
        customerName: 'Idempotency Customer',
        phone: '01066667777',
        email: 'idemp.cust@example.com',
        address: 'Nasr City',
        city: 'Cairo',
        items: [{ productId: testProduct.id, quantity: 1 }],
        idempotencyKey: sharedKey,
      };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/orders').send(payload),
        request(app).post('/api/orders').send(payload),
      ]);

      expect([200, 201]).toContain(res1.status);
      expect([200, 201]).toContain(res2.status);
      expect(res1.body.data.orderNumber).toBe(res2.body.data.orderNumber);

      // Exactly ONE order in database
      const orderCount = await testPrisma.order.count({
        where: { idempotencyKey: sharedKey },
      });
      expect(orderCount).toBe(1);

      // Stock deducted only once (15 - 1 = 14)
      const prodAfter = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(prodAfter!.stock).toBe(14);
    });

    it('Scenario 5: Same idempotency key with DIFFERENT payload -> rejected with HTTP 409 Conflict', async () => {
      const conflictKey = `idemp_pg_conflict_${Date.now()}`;

      const testProduct = await testPrisma.product.findFirst();

      const initialPayload = {
        customerName: 'Initial Customer',
        phone: '01011119999',
        email: 'initial@example.com',
        address: 'Address 1',
        city: 'Cairo',
        items: [{ productId: testProduct!.id, quantity: 1 }],
        idempotencyKey: conflictKey,
      };

      const res1 = await request(app).post('/api/orders').send(initialPayload);
      expect(res1.status).toBe(201);

      // Different customer name reusing the same key
      const res2 = await request(app).post('/api/orders').send({
        ...initialPayload,
        customerName: 'Tampered Customer Name',
      });

      expect(res2.status).toBe(409);
      expect(res2.body.success).toBe(false);
    });

    it('Scenario 6: Generic status endpoint MUST REJECT setting paymentStatus: PAID with HTTP 400', async () => {
      const order = await testPrisma.order.findFirst();
      if (!order) return;

      const patchRes = await request(app)
        .patch(`/api/orders/${order.orderNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
        });

      expect(patchRes.status).toBe(400);
      expect(patchRes.body.message).toMatch(/(لا يمكن تعيين حالة الدفع مباشرة|حصراً عبر الإجراء المخصص)/);
    });

    it('Scenario 7: Header-Only Tracking Authorization & Privacy via real HTTP route', async () => {
      const order = await testPrisma.order.findFirst();
      if (!order || !order.trackingTokenHash) return;

      // 1. Missing header -> 400
      const resNoHeader = await request(app).get(`/api/orders/track/${order.orderNumber}`);
      expect(resNoHeader.status).toBe(400);

      // 2. Query-string token -> 400 rejected
      const resQueryToken = await request(app)
        .get(`/api/orders/track/${order.orderNumber}`)
        .query({ token: 'some_query_token_attempt' });
      expect(resQueryToken.status).toBe(400);

      // 3. Body token -> 400 rejected
      const resBodyToken = await request(app)
        .post('/api/orders/track')
        .send({ orderNumber: order.orderNumber, token: 'some_body_token_attempt' });
      expect(resBodyToken.status).toBe(400);
    });
  }
);

// Informational test when live PostgreSQL is offline
describe.skipIf(isLivePostgresAvailable)(
  'Issue 5: PostgreSQL Live Integration Suite (Notice)',
  () => {
    it('verifies safety guard: integration tests strictly require TEST_DATABASE_URL with a test database', () => {
      expect(verifyTestDatabaseSafety(undefined)).toBe(false);
      expect(() =>
        verifyTestDatabaseSafety('postgresql://postgres:secret@localhost:5432/optica_production')
      ).toThrow(/protect non-test data|contains "prod"/i);
    });
  }
);
