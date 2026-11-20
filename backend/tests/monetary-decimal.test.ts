import Decimal from 'decimal.js';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { isolatedTestDb, seedIsolatedTestData } from '../src/database/prisma';

const app = createApp();

describe('Issue 5: Monetary Decimal Arithmetic & Precision Verification', () => {
  beforeEach(async () => {
    await seedIsolatedTestData();
  });

  it('Floating Point Trap: JS standard IEEE-754 arithmetic fails, but Decimal arithmetic is exact', () => {
    // JavaScript native float bug demonstration:
    const jsNativeFloatBug = 0.1 + 0.2;
    expect(jsNativeFloatBug).not.toBe(0.3); // 0.30000000000000004

    // Optica Luxe Decimal.js exact precision:
    Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
    const decimalSum = new Decimal('0.1').plus('0.2').toDecimalPlaces(2).toNumber();
    expect(decimalSum).toBe(0.3);
  });

  it('should compute line items and order subtotal with exact Decimal precision and half-up rounding', async () => {
    // Add product with specific decimal price
    isolatedTestDb.products.push({
      id: 'opt-decimal-test',
      name: 'Decimal Test Eyewear',
      nameAr: 'نظارة اختبار الدقة العشرية',
      price: 199.99,
      oldPrice: null,
      discountPercent: null,
      image: 'https://example.com/test.jpg',
      category: 'sunglasses',
      brand: 'TestBrand',
      stock: 10,
      sku: 'DEC-001',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'فادي سمير',
        phone: '01011112222',
        email: 'fadi@example.com',
        address: 'الدقي',
        city: 'الجيزة',
        items: [{ productId: 'opt-decimal-test', quantity: 3 }],
        idempotencyKey: 'idemp_monetary_decimal_key_01',
      });

    expect(res.status).toBe(201);
    const data = res.body.data;

    // 199.99 * 3 = 599.97 exactly
    expect(data.subtotal).toBe(599.97);
    // Shipping below 2000 EGP is 75.00 EGP
    expect(data.shipping).toBe(75);
    // Total = 599.97 + 75.00 = 674.97
    expect(data.total).toBe(674.97);

    // Verify item total
    expect(data.items[0].unitPrice).toBe(199.99);
    expect(data.items[0].total).toBe(599.97);
  });

  it('Coupon discount percentage rounding: 15% discount on 199.99 must round half-up to exactly 2 decimals', async () => {
    isolatedTestDb.products.push({
      id: 'opt-coupon-decimal',
      name: 'Coupon Decimal Frame',
      price: 199.99,
      oldPrice: null,
      discountPercent: null,
      image: 'https://example.com/test.jpg',
      category: 'sunglasses',
      brand: 'TestBrand',
      stock: 10,
      sku: 'DEC-CPN-001',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'سليمان خالد',
        phone: '01055556666',
        email: 'soliman@example.com',
        address: 'المعادي',
        city: 'القاهرة',
        items: [{ productId: 'opt-coupon-decimal', quantity: 1 }],
        couponCode: 'LUXE2026', // 15%
        idempotencyKey: 'idemp_monetary_decimal_key_02',
      });

    expect(res.status).toBe(201);
    const data = res.body.data;

    // Subtotal: 199.99
    // 15% of 199.99 = 29.9985 -> Half-up rounded to 2 decimal places = 30.00 EGP
    expect(data.subtotal).toBe(199.99);
    expect(data.discount).toBe(30);
    // Shipping: 75.00
    // Total: 199.99 - 30.00 + 75.00 = 244.99
    expect(data.total).toBe(244.99);
  });
});
