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

describe('Issues 4 & 5: Order State Machine, Cancellation & COD Rules', () => {
  let adminToken: string;

  beforeEach(async () => {
    await seedIsolatedTestData();
    adminToken = getAdminToken();
  });

  it('new COD orders must start with paymentMethod=COD, paymentStatus=UNPAID, and orderStatus=PENDING', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'حازم إمام',
        phone: '01011112222',
        email: 'hazem@example.com',
        address: 'الزمالك، القاهرة',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 2 }],
      });

    expect(res.status).toBe(201);
    const order = res.body.data;
    expect(order.paymentMethod).toBe('COD');
    expect(order.paymentStatus).toBe('UNPAID');
    expect(order.orderStatus).toBe('PENDING');
  });

  it('should REJECT marking payment as PAID while order is PENDING, CONFIRMED, PROCESSING, or SHIPPED', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'ياسر جلال',
        phone: '01122223333',
        email: 'yasser@example.com',
        address: 'شارع الهرم',
        city: 'الجيزة',
        items: [{ productId: 'opt-002', quantity: 1 }],
      });

    const orderId = checkoutRes.body.data.id;

    // 2. Try to mark as PAID while PENDING -> MUST FAIL
    const patchPendingPaid = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'PENDING',
        paymentStatus: 'PAID',
      });

    expect(patchPendingPaid.status).toBe(400);
    expect(patchPendingPaid.body.message).toContain('لا يمكن تعيين حالة الدفع');

    // 3. Confirm order, then try to mark PAID -> MUST FAIL
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });

    const patchConfirmedPaid = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
      });

    expect(patchConfirmedPaid.status).toBe(400);

    // 4. Ship order, then try to mark PAID before delivery -> MUST FAIL
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });

    const patchShippedPaid = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'SHIPPED',
        paymentStatus: 'PAID',
      });

    expect(patchShippedPaid.status).toBe(400);
  });

  it('should allow marking payment as PAID ONLY when order is DELIVERED and cash is collected', async () => {
    // Place order
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'شريف منير',
        phone: '01033334444',
        email: 'sherif@example.com',
        address: 'مدينة نصر',
        city: 'القاهرة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    const orderId = checkoutRes.body.data.id;

    // Transition PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });

    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });

    // Mark as DELIVERED with cash collected (PAID)
    const deliverRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        notes: 'تم استلام النقدية بالكامل من العميل عند التسليم.',
      });

    expect(deliverRes.status).toBe(200);
    expect(deliverRes.body.data.orderStatus).toBe('DELIVERED');
    expect(deliverRes.body.data.paymentStatus).toBe('PAID');
  });

  it('should restore inventory exactly once upon order cancellation', async () => {
    const prodBefore = isolatedTestDb.products.find((p) => p.id === 'opt-003')!;
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
        items: [{ productId: 'opt-003', quantity: 2 }],
      });

    const orderId = checkoutRes.body.data.id;
    expect(prodBefore.stock).toBe(initialStock - 2); // 3

    // Cancel order
    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
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
    const prod = isolatedTestDb.products.find((p) => p.id === 'opt-001')!;
    const initialStock = prod.stock;

    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'تامر حسني',
        phone: '01088889999',
        email: 'tamer@example.com',
        address: 'الشيخ زايد',
        city: 'الجيزة',
        items: [{ productId: 'opt-001', quantity: 1 }],
      });

    const orderId = checkoutRes.body.data.id;
    expect(prod.stock).toBe(initialStock - 1);

    // First cancel -> Restores stock back to initialStock
    const cancel1 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });
    expect(cancel1.status).toBe(200);
    expect(prod.stock).toBe(initialStock);

    // Second cancel attempt -> Must NOT double-restore stock
    const cancel2 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });

    // Stock must remain initialStock, not initialStock + 1!
    expect(prod.stock).toBe(initialStock);
  });

  it('DELIVERED orders cannot be cancelled', async () => {
    const checkoutRes = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'محمد حماقي',
        phone: '01099990000',
        email: 'hamaki@example.com',
        address: 'المهندسين',
        city: 'الجيزة',
        items: [{ productId: 'opt-002', quantity: 1 }],
      });

    const orderId = checkoutRes.body.data.id;

    // Move to DELIVERED
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'PROCESSING' });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'SHIPPED' });
    await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'DELIVERED', paymentStatus: 'PAID' });

    // Attempt to cancel DELIVERED order -> MUST BE REJECTED
    const cancelAttempt = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CANCELLED' });

    expect(cancelAttempt.status).toBe(400);
    expect(cancelAttempt.body.message).toMatch(/(انتقال حالة الطلب غير صالح|لا يمكن إلغاء)/);
  });
});
