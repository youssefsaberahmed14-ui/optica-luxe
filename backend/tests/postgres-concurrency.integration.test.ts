import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const testDbUrl = process.env.TEST_DATABASE_URL;

// Safety check function: Guarantees integration tests NEVER run against production databases
function verifyTestDatabaseSafety(url: string | undefined): boolean {
  if (!url) return false;

  const lowercase = url.toLowerCase();
  // Must be PostgreSQL
  if (!lowercase.startsWith('postgres://') && !lowercase.startsWith('postgresql://')) {
    throw new Error('[Safety Guard] TEST_DATABASE_URL must be a valid PostgreSQL connection string.');
  }

  // Must contain 'test' in the database name
  const dbNameMatch = lowercase.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';

  if (!dbName.includes('test')) {
    throw new Error(
      `[Safety Guard] Integration tests can ONLY run against databases containing 'test' in their name (Found: "${dbName}"). Aborting to protect non-test data.`
    );
  }

  // Reject production keywords
  if (dbName.includes('prod') || dbName.includes('production')) {
    throw new Error('[Safety Guard] Fatal: Database name contains "prod". Execution aborted.');
  }

  return true;
}

const isLivePostgresAvailable = Boolean(testDbUrl && verifyTestDatabaseSafety(testDbUrl));

describe.runIf(isLivePostgresAvailable)(
  'Issue 4: Real PostgreSQL Integration & Concurrency Tests (Active LIVE Database)',
  () => {
    let testPrisma: PrismaClient;

    beforeAll(async () => {
      testPrisma = new PrismaClient({
        datasources: { db: { url: testDbUrl } },
      });
      await testPrisma.$connect();
    });

    afterAll(async () => {
      await testPrisma.$disconnect();
    });

    it('Scenario 1: Two customers buying the last item (stock=1) concurrently -> exactly ONE succeeds and stock=0', async () => {
      // 1. Seed a test product with stock = 1
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-CONCURRENCY-01' },
        update: { stock: 1, price: new Decimal(2500) },
        create: {
          sku: 'PG-CONCURRENCY-01',
          name: 'Postgres Concurrency Test Frame',
          price: new Decimal(2500),
          stock: 1,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      expect(testProduct.stock).toBe(1);

      // Attempt 2 parallel transactions directly against PostgreSQL
      const executeOrderTransaction = async (customerName: string) => {
        return testPrisma.$transaction(async (tx) => {
          // Conditional atomic decrement
          const updateResult = await tx.product.updateMany({
            where: {
              id: testProduct.id,
              stock: { gte: 1 },
            },
            data: {
              stock: { decrement: 1 },
            },
          });

          if (updateResult.count === 0) {
            throw new Error('OUT_OF_STOCK');
          }

          const order = await tx.order.create({
            data: {
              orderNumber: `OPT-PG-TEST-${Math.floor(10000 + Math.random() * 90000)}`,
              customerName,
              phone: '01011112222',
              email: 'test@example.com',
              address: 'Test Address',
              city: 'Cairo',
              subtotal: new Decimal(2500),
              total: new Decimal(2500),
              items: {
                create: [
                  {
                    productId: testProduct.id,
                    productName: testProduct.name,
                    productImage: testProduct.image,
                    unitPrice: new Decimal(2500),
                    quantity: 1,
                    total: new Decimal(2500),
                  },
                ],
              },
            },
          });

          return order;
        });
      };

      const results = await Promise.allSettled([
        executeOrderTransaction('Customer Alpha'),
        executeOrderTransaction('Customer Beta'),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly ONE succeeds
      expect(fulfilled.length).toBe(1);
      // Exactly ONE is rejected with out of stock
      expect(rejected.length).toBe(1);

      // Stock in PostgreSQL must be exactly 0, never negative
      const updatedProduct = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct!.stock).toBe(0);
    });

    it('Scenario 2: Duplicate simultaneous cancellations -> inventory restored exactly ONCE', async () => {
      // 1. Seed product with stock = 3
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-CANCEL-02' },
        update: { stock: 3, price: new Decimal(1500) },
        create: {
          sku: 'PG-CANCEL-02',
          name: 'Cancellation Concurrency Frame',
          price: new Decimal(1500),
          stock: 3,
          category: 'eyeglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      // 2. Create order with 2 items -> stock decreases from 5 to 3
      const order = await testPrisma.order.create({
        data: {
          orderNumber: `OPT-CANCEL-TEST-${Math.floor(10000 + Math.random() * 90000)}`,
          customerName: 'Cancel Test Customer',
          phone: '01033334444',
          email: 'cancel@example.com',
          address: 'Test Address',
          city: 'Cairo',
          subtotal: new Decimal(3000),
          total: new Decimal(3000),
          orderStatus: 'PENDING',
          items: {
            create: [
              {
                productId: testProduct.id,
                productName: testProduct.name,
                productImage: testProduct.image,
                unitPrice: new Decimal(1500),
                quantity: 2,
                total: new Decimal(3000),
              },
            ],
          },
        },
        include: { items: true },
      });

      const initialStock = 3;

      // 3. Two simultaneous cancellation transactions
      const executeCancelTransaction = async () => {
        return testPrisma.$transaction(async (tx) => {
          // Atomic conditional update ensuring only non-cancelled orders can transition to CANCELLED
          const updateOrder = await tx.order.updateMany({
            where: {
              id: order.id,
              orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
            },
            data: {
              orderStatus: 'CANCELLED',
              cancelledAt: new Date(),
            },
          });

          if (updateOrder.count === 0) {
            throw new Error('ALREADY_CANCELLED');
          }

          // Restore stock
          await tx.product.update({
            where: { id: testProduct.id },
            data: { stock: { increment: 2 } },
          });

          return true;
        });
      };

      const cancelResults = await Promise.allSettled([
        executeCancelTransaction(),
        executeCancelTransaction(),
      ]);

      const successfulCancels = cancelResults.filter((r) => r.status === 'fulfilled');
      const failedCancels = cancelResults.filter((r) => r.status === 'rejected');

      // Exactly one cancellation restored inventory
      expect(successfulCancels.length).toBe(1);
      expect(failedCancels.length).toBe(1);

      // Stock in PostgreSQL must be restored by 2 (initial 3 + 2 = 5), NEVER 7 (3 + 2 + 2)
      const finalProduct = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(finalProduct!.stock).toBe(initialStock + 2);
    });

    it('Scenario 3: Two simultaneous requests using the same idempotency key -> duplicate order not created', async () => {
      const uniqueIdempotencyKey = `idemp_pg_concurrency_${Date.now()}`;

      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-IDEMP-03' },
        update: { stock: 10, price: new Decimal(1200) },
        create: {
          sku: 'PG-IDEMP-03',
          name: 'Idempotency Concurrency Frame',
          price: new Decimal(1200),
          stock: 10,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      const createWithIdempotency = async () => {
        try {
          return await testPrisma.$transaction(async (tx) => {
            return tx.order.create({
              data: {
                orderNumber: `OPT-IDEMP-${Math.floor(10000 + Math.random() * 90000)}`,
                idempotencyKey: uniqueIdempotencyKey,
                customerName: 'Idempotent Customer',
                phone: '01055556666',
                email: 'idemp@example.com',
                address: 'Test Address',
                city: 'Cairo',
                subtotal: new Decimal(1200),
                total: new Decimal(1200),
                items: {
                  create: [
                    {
                      productId: testProduct.id,
                      productName: testProduct.name,
                      productImage: testProduct.image,
                      unitPrice: new Decimal(1200),
                      quantity: 1,
                      total: new Decimal(1200),
                    },
                  ],
                },
              },
            });
          });
        } catch (err: any) {
          if (err.code === 'P2002') {
            // Unique constraint on idempotencyKey handled gracefully
            return testPrisma.order.findUnique({
              where: { idempotencyKey: uniqueIdempotencyKey },
            });
          }
          throw err;
        }
      };

      const [orderA, orderB] = await Promise.all([
        createWithIdempotency(),
        createWithIdempotency(),
      ]);

      // Both callers receive the exact same order
      expect(orderA).toBeDefined();
      expect(orderB).toBeDefined();
      expect(orderA!.id).toBe(orderB!.id);
      expect(orderA!.orderNumber).toBe(orderB!.orderNumber);

      // Verify only 1 order exists in PostgreSQL for this idempotency key
      const count = await testPrisma.order.count({
        where: { idempotencyKey: uniqueIdempotencyKey },
      });
      expect(count).toBe(1);
    });

    it('Scenario 4: Database failure rolls back complete transaction (No partial deduction or order creation)', async () => {
      const testProduct = await testPrisma.product.upsert({
        where: { sku: 'PG-ROLLBACK-04' },
        update: { stock: 8, price: new Decimal(2000) },
        create: {
          sku: 'PG-ROLLBACK-04',
          name: 'Rollback Verification Frame',
          price: new Decimal(2000),
          stock: 8,
          category: 'sunglasses',
          brand: 'OpticaLuxe',
          image: 'https://example.com/test.jpg',
        },
      });

      const initialStock = testProduct.stock; // 8
      const orderCountBefore = await testPrisma.order.count();

      // Transaction that fails halfway
      await expect(
        testPrisma.$transaction(async (tx) => {
          // 1. Deduct stock
          await tx.product.update({
            where: { id: testProduct.id },
            data: { stock: { decrement: 2 } },
          });

          // 2. Simulate fatal unhandled runtime or database error
          throw new Error('SIMULATED_TRANSACTION_FAILURE');
        })
      ).rejects.toThrow('SIMULATED_TRANSACTION_FAILURE');

      // Stock must be completely rolled back to initialStock (8)
      const productAfter = await testPrisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(productAfter!.stock).toBe(initialStock);

      // No new orders should have been committed
      const orderCountAfter = await testPrisma.order.count();
      expect(orderCountAfter).toBe(orderCountBefore);
    });
  }
);

// Informational test when live PostgreSQL is offline
describe.skipIf(isLivePostgresAvailable)(
  'Issue 4: PostgreSQL Live Integration Suite (Notice)',
  () => {
    it('verifies safety guard: integration tests strictly require TEST_DATABASE_URL with a test database', () => {
      expect(verifyTestDatabaseSafety(undefined)).toBe(false);
      expect(() =>
        verifyTestDatabaseSafety('postgresql://postgres:secret@localhost:5432/optica_production')
      ).toThrow(/protect non-test data|contains "prod"/i);
    });
  }
);
