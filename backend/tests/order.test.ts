import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { seedIsolatedTestData } from '../src/database/prisma';

const app = createApp();

describe('Order Creation & Authoritative Pricing API', () => {
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
      items: [{ productId: 'opt-001', quantity: 1 }],
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
      items: [{ productId: 'opt-001', quantity: 1 }],
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
          productId: 'opt-003', // Lindberg with only 5 in stock
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
          productId: 'opt-002', // Tom Ford (1950 EGP)
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
});
