import jsonwebtoken from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { isolatedTestDb, seedIsolatedTestData, TEST_UUIDS } from '../src/database/prisma';

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

describe('Issues 1, 2, 4 & 8: Order State Machine, Cancellation, COD Rules & Dedicated Cash Collection', () => {
  let adminToken: string;

  beforeEach(async () => {
    await seedIsolatedTestData();
    adminToken = getAdminToken();
  });

  it('New order creation must STRICTLY default to paymentMethod=COD and paymentStatus=UNPAID and orderStatus=PENDING', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'حسام حسن',
        phone: '01012345678',
        email: 'hossam@example.com',
        address: 'شارع الهرم، الجيزة',
        city: 'الجيزة',
        items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
        idempotencyKey: 'idemp_lifecycle_order_01_key',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.paymentMethod).toBe('COD');
    expect(res.body.data.paymentStatus).toBe('UNPAID');
    expect(res.body.data.orderStatus).toBe('PENDING');
  });

  it('Issue 2: Generic status endpoint MUST REJECT setting paymentStatus: PAID with HTTP 400 at any stage', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'ياسر جلال',
        phone: '01122223333',
        email: 'yasser@example.com',
        address: 'شارع الهرم',
        city: 'الجيزة',
        items: [{ productId: TEST_UUIDS.tomFord, quantity: 1 }],
        idempotencyKey: 'idemp_lifecycle_order_02_key',
      });

    const orderNumber = checkoutRes.body.data.orderNumber;

    // 2. Try to mark as PAID while PENDING via generic PATCH -> MUST FAIL (400)
    const patchPendingPaid = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'PENDING',
        paymentStatus: 'PAID',
      });

    expect(patchPendingPaid.status).toBe(400);
    expect(JSON.stringify(patchPendingPaid.body)).toMatch(/(لا يمكن تعيين حالة الدفع مباشرة|حصراً عبر الإجراء المخصص|لا يمكن تحويل حالة الدفع إلى مدفوع|تعديل حالة الدفع غير مسموح به)/);

    // 3. Move to DELIVERED, then try to mark PAID via generic PATCH -> MUST STILL FAIL (400)
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });

    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });

    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });

    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'DELIVERED' });

    // Even when DELIVERED, generic endpoint MUST REJECT setting PAID!
    const patchDeliveredPaid = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
      });

    expect(patchDeliveredPaid.status).toBe(400);
    expect(JSON.stringify(patchDeliveredPaid.body)).toMatch(/(لا يمكن تعيين حالة الدفع مباشرة|حصراً عبر الإجراء المخصص|لا يمكن تحويل حالة الدفع إلى مدفوع)/);
  });

  it('Dedicated Cash Collection (POST /api/orders/:id/collect-cash): should enforce DELIVERED status, record paidAt/paidBy, and be idempotent', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'فاروق حسني',
        phone: '01044445555',
        email: 'farouk@example.com',
        address: 'الزمالك',
        city: 'القاهرة',
        items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
        idempotencyKey: 'idemp_lifecycle_order_03_key',
      });

    const orderNumber = checkoutRes.body.data.orderNumber;

    // 2. Unauthenticated attempt -> 401
    const unauthCollect = await request(app).post(`/api/orders/${orderNumber}/collect-cash`);
    expect(unauthCollect.status).toBe(401);

    // 3. Attempt while still PENDING -> 400
    const earlyCollect = await request(app)
      .post(`/api/orders/${orderNumber}/collect-cash`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(earlyCollect.status).toBe(400);
    expect(earlyCollect.body.message).toContain('لا يمكن تأكيد تحصيل النقدية');

    // 4. Progress order to DELIVERED
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'DELIVERED' });

    // 5. Successful Cash Collection exclusively through dedicated endpoint
    const collectRes = await request(app)
      .post(`/api/orders/${orderNumber}/collect-cash`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(collectRes.status).toBe(200);
    expect(collectRes.body.success).toBe(true);
    expect(collectRes.body.alreadyPaid).toBe(false);
    expect(collectRes.body.data.paymentStatus).toBe('PAID');
    expect(collectRes.body.data.paidAt).toBeDefined();
    expect(collectRes.body.data.paidBy).toBe('admin@optica-luxe.com');

    // 6. Repeated collection call -> idempotent (alreadyPaid: true, no error)
    const repeatCollect = await request(app)
      .post(`/api/orders/${orderNumber}/collect-cash`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(repeatCollect.status).toBe(200);
    expect(repeatCollect.body.alreadyPaid).toBe(true);
  });

  it('should restore inventory exactly once upon order cancellation', async () => {
    const prodBefore = isolatedTestDb.products.find((p) => p.id === TEST_UUIDS.lindberg)!;
    const initialStock = prodBefore.stock; // 5

    // Order 2 units
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'عمرو دياب',
        phone: '01077778888',
        email: 'amr@example.com',
        address: 'جاردن سيتي',
        city: 'القاهرة',
        items: [{ productId: TEST_UUIDS.lindberg, quantity: 2 }],
        idempotencyKey: 'idemp_lifecycle_order_04_key',
      });

    const orderNumber = checkoutRes.body.data.orderNumber;
    expect(prodBefore.stock).toBe(initialStock - 2); // 3

    // Cancel order
    const cancelRes = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'CANCELLED',
        cancellationReason: 'طلب العميل إلغاء الطلب قبل الشحن',
      });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.orderStatus).toBe('CANCELLED');
    expect(cancelRes.body.data.paymentStatus).toBe('UNPAID');

    // Stock must be restored to initial level (5)
    expect(prodBefore.stock).toBe(initialStock);
  });

  it('repeated cancellation must NOT restore inventory a second time', async () => {
    const prod = isolatedTestDb.products.find((p) => p.id === TEST_UUIDS.cartier)!;
    const initialStock = prod.stock;

    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'تامر حسني',
        phone: '01088889999',
        email: 'tamer@example.com',
        address: 'الشيخ زايد',
        city: 'الجيزة',
        items: [{ productId: TEST_UUIDS.cartier, quantity: 1 }],
        idempotencyKey: 'idemp_lifecycle_order_05_key',
      });

    const orderNumber = checkoutRes.body.data.orderNumber;
    expect(prod.stock).toBe(initialStock - 1);

    // First cancel -> Restores stock back to initialStock
    const cancel1 = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });
    expect(cancel1.status).toBe(200);
    expect(prod.stock).toBe(initialStock);

    // Second cancel attempt -> Must NOT double-restore stock
    const cancel2 = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });

    // Stock must remain initialStock, not initialStock + 1!
    expect(prod.stock).toBe(initialStock);
  });

  it('DELIVERED orders cannot be cancelled and CANCELLED orders cannot be collected for cash', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'محمد حماقي',
        phone: '01099990000',
        email: 'hamaki@example.com',
        address: 'المهندسين',
        city: 'الجيزة',
        items: [{ productId: TEST_UUIDS.tomFord, quantity: 1 }],
        idempotencyKey: 'idemp_lifecycle_order_06_key',
      });

    const orderNumber = checkoutRes.body.data.orderNumber;

    // Move to DELIVERED
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });
    await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'DELIVERED' });

    // Attempt to cancel DELIVERED order -> MUST BE REJECTED
    const cancelAttempt = await request(app)
      .patch(`/api/orders/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });

    expect(cancelAttempt.status).toBe(400);
    expect(cancelAttempt.body.message).toMatch(/(انتقال حالة الطلب غير صالح|لا يمكن إلغاء)/);
  });
});
