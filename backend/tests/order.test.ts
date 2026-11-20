import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { initializeDatabase } from '../src/database/prisma';

const app = createApp();

describe('Order Creation & Validation API', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  it('should reject order creation with empty cart', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'محمد أحمد',
      phone: '01012345678',
      email: 'mohamed@example.com',
      address: 'القاهرة، المعادي',
      city: 'القاهرة',
      items: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
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
    });

    expect(res.status).toBe(400);
  });

  it('should create order, calculate server-side prices, and return unique order number', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'فؤاد المهندس',
      phone: '01099998888',
      email: 'fouad@example.com',
      address: 'شارع الهرم، الجيزة',
      city: 'الجيزة',
      items: [
        {
          productId: 'opt-002', // Tom Ford (1950 EGP)
          quantity: 1,
          selectedColor: 'هافانا داكن',
        },
      ],
      couponCode: 'LUXE2026', // 15% discount
      paymentMethod: 'demo_card',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.data;
    expect(order.orderNumber).toMatch(/^OPT-2026-\d+$/);
    expect(order.subtotal).toBe(1950);
    expect(order.discount).toBe(Math.round((1950 * 15) / 100)); // 293
    expect(order.total).toBe(1950 - 293); // 1657 (free shipping >= 500)
    expect(order.items.length).toBe(1);
    expect(order.items[0].productName).toContain('توم فورد');
  });

  it('should reject order when requested quantity exceeds available stock', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'عميل التجربة',
      phone: '01000000000',
      email: 'exceed@example.com',
      address: 'عنوان تجريبي',
      city: 'القاهرة',
      items: [
        {
          productId: 'opt-003', // stock is 5
          quantity: 999,
        },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('غير متوفرة في المخزون');
  });
});
