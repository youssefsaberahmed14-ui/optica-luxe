import crypto from 'crypto';
import Decimal from 'decimal.js';
import { env } from '../config/env';
import { isPostgresConnected, isolatedTestDb, prisma } from '../database/prisma';
import { CreateOrderInput, TrackOrderInput, UpdateOrderStatusInput } from '../validators/order.validator';

// Configure Decimal precision & Half-Up rounding for financial EGP calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface OrderQueryFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest' | 'total_desc' | 'total_asc' | string;
}

export interface AdminActor {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

// Sanitized Order Item DTO for public checkout confirmation
export interface SanitizedOrderItemSummary {
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  selectedColor?: string | null;
  lensOption?: string | null;
}

// Sanitized Checkout Confirmation DTO (Zero private customer data, zero DB IDs, zero token hashes)
export interface SanitizedOrderConfirmation {
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: Date | string;
  items: SanitizedOrderItemSummary[];
}

// Valid Order Status State Machine Transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class OrderService {
  /**
   * Generates a cryptographically secure, unguessable tracking token (256-bit entropy).
   */
  private generateTrackingToken(): { rawToken: string; tokenHash: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, tokenHash };
  }

  /**
   * Generates a unique, non-predictable order number (e.g. OPT-2026-00012).
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = isPostgresConnected
      ? (await prisma.order.count()) + 1
      : isolatedTestDb.orders.length + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const seq = String(count).padStart(4, '0');
    return `OPT-${year}-${seq}-${randomSuffix}`;
  }

  /**
   * Sanitizes an order record into the safe checkout confirmation DTO.
   * Strips all internal IDs, token hashes, and unnecessary customer PII.
   */
  public sanitizeOrderConfirmation(order: any): SanitizedOrderConfirmation {
    const subtotal = new Decimal(order.subtotal?.toString() || '0').toNumber();
    const discount = new Decimal(order.discount?.toString() || '0').toNumber();
    const shipping = new Decimal(order.shipping?.toString() || '0').toNumber();
    const total = new Decimal(order.total?.toString() || '0').toNumber();

    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal,
      discount,
      shipping,
      total,
      createdAt: order.createdAt,
      items: (order.items || []).map((item: any) => ({
        productName: item.productName,
        productImage: item.productImage || '',
        quantity: item.quantity,
        unitPrice: new Decimal(item.unitPrice?.toString() || '0').toNumber(),
        total: new Decimal(item.total?.toString() || '0').toNumber(),
        selectedColor: item.selectedColor || null,
        lensOption: item.lensOption || null,
      })),
    };
  }

  /**
   * Verifies if an existing order matches the submitted checkout payload for idempotency.
   */
  private isPayloadMatching(existingOrder: any, input: CreateOrderInput): boolean {
    const normalize = (s: string) => s.trim().toLowerCase();
    if (normalize(existingOrder.customerName) !== normalize(input.customerName)) return false;
    if (normalize(existingOrder.email) !== normalize(input.email)) return false;
    if (normalize(existingOrder.phone) !== normalize(input.phone)) return false;

    // Compare item count
    if (!existingOrder.items || existingOrder.items.length !== input.items.length) return false;

    // Compare item productIds and quantities
    for (const inItem of input.items) {
      const match = existingOrder.items.find(
        (ex: any) => ex.productId === inItem.productId && ex.quantity === inItem.quantity
      );
      if (!match) return false;
    }

    return true;
  }

  /**
   * Creates a new customer COD order inside an atomic transaction.
   * Performs authoritative server-side pricing with Decimal arithmetic, inventory deduction,
   * coupon validation, and strict idempotency handling.
   */
  async createOrder(input: CreateOrderInput) {
    // In production, PostgreSQL is mandatory. No in-memory orders allowed.
    if (env.isProduction && !isPostgresConnected) {
      throw {
        statusCode: 503,
        message: 'خدمة الطلبات غير متاحة حالياً لعدم توفر قاعدة البيانات. يرجى المحاولة لاحقاً.',
      };
    }

    if (!input.items || input.items.length === 0) {
      throw { statusCode: 400, message: 'سلة المشتريات فارغة.' };
    }

    // Strict validation of mandatory idempotencyKey
    if (
      !input.idempotencyKey ||
      typeof input.idempotencyKey !== 'string' ||
      input.idempotencyKey.trim().length < 16
    ) {
      throw {
        statusCode: 400,
        message: 'مفتاح عدم التكرار (Idempotency Key) مطلوب لتأكيد الطلب ويجب ألا يقل عن 16 حرفاً.',
      };
    }

    // 1. Idempotency Check: Prevent duplicate orders if client retries with same idempotency key
    if (input.idempotencyKey) {
      const existing = isPostgresConnected
        ? await prisma.order.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
            include: { items: true },
          })
        : isolatedTestDb.orders.find((o) => o.idempotencyKey === input.idempotencyKey);

      if (existing) {
        // Enforce that re-using the same key with a DIFFERENT payload is rejected
        if (!this.isPayloadMatching(existing, input)) {
          throw {
            statusCode: 409,
            message: 'مفتاح عدم التكرار (Idempotency Key) مسجل مسبقاً لطلب مختلف. لا يمكن استخدام نفس المفتاح مع بيانات طلب مختلفة.',
          };
        }

        return {
          order: this.sanitizeOrderConfirmation(existing),
          trackingToken: null,
          isDuplicate: true,
        };
      }
    }

    // 2. Deterministic sort of product IDs to eliminate database lock deadlocks
    const uniqueProductIds = [...new Set(input.items.map((i) => i.productId))].sort();

    // 3. Generate secure tracking token
    const { rawToken, tokenHash } = this.generateTrackingToken();
    const orderNumber = await this.generateOrderNumber();

    // --- Production / Live PostgreSQL Path with Atomic Transactions ---
    if (isPostgresConnected) {
      try {
        return await prisma.$transaction(async (tx) => {
          // A. Authoritative product lookup
          const dbProducts = await tx.product.findMany({
            where: { id: { in: uniqueProductIds } },
          });

          if (dbProducts.length !== uniqueProductIds.length) {
            throw { statusCode: 400, message: 'أحد المنتجات المطلوبة غير متوفر في المتجر.' };
          }

          // B. Calculate subtotal & construct items with server prices using Decimal arithmetic
          let calculatedSubtotal = new Decimal(0);
          const itemsToCreate: any[] = [];

          for (const item of input.items) {
            const dbProd = dbProducts.find((p) => p.id === item.productId);
            if (!dbProd) {
              throw { statusCode: 400, message: `المنتج رقم ${item.productId} غير موجود.` };
            }

            if (item.quantity <= 0) {
              throw { statusCode: 400, message: 'الكمية المطلوبة يجب أن تكون أكبر من الصفر.' };
            }

            // C. Atomic conditional inventory deduction: stock >= quantity
            const updateStockResult = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity },
              },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            if (updateStockResult.count === 0) {
              throw {
                statusCode: 400,
                message: `عذراً، الكمية المطلوبة للمنتج "${dbProd.nameAr || dbProd.name}" غير متوفرة في المخزون (المتبقي: ${dbProd.stock}).`,
              };
            }

            const unitPrice = new Decimal(dbProd.price.toString()).toDecimalPlaces(2);
            const lineTotal = unitPrice.times(item.quantity).toDecimalPlaces(2);
            calculatedSubtotal = calculatedSubtotal.plus(lineTotal).toDecimalPlaces(2);

            itemsToCreate.push({
              productId: dbProd.id,
              productName: dbProd.nameAr || dbProd.name,
              productImage: dbProd.image || '',
              unitPrice: unitPrice.toNumber(),
              quantity: item.quantity,
              total: lineTotal.toNumber(),
              selectedColor: item.selectedColor || null,
              lensOption: item.lensOption || null,
            });
          }

          // D. Coupon validation & discount calculation using Decimal arithmetic
          let discountAmount = new Decimal(0);
          let validCouponCode: string | null = null;

          if (input.couponCode && input.couponCode.trim() !== '') {
            const code = input.couponCode.trim().toUpperCase();
            const coupon = await tx.coupon.findUnique({ where: { code } });

            if (coupon && coupon.isActive) {
              const notExpired = !coupon.expiryDate || new Date(coupon.expiryDate) > new Date();
              if (notExpired) {
                validCouponCode = coupon.code;
                const cVal = new Decimal(coupon.discountValue.toString());
                if (coupon.discountType === 'PERCENTAGE') {
                  discountAmount = calculatedSubtotal.times(cVal).dividedBy(100).toDecimalPlaces(2);
                } else {
                  discountAmount = Decimal.min(cVal, calculatedSubtotal).toDecimalPlaces(2);
                }

                await tx.coupon.update({
                  where: { id: coupon.id },
                  data: { usageCount: { increment: 1 } },
                });
              }
            }
          }

          const shipping = calculatedSubtotal.greaterThanOrEqualTo(2000)
            ? new Decimal(0)
            : new Decimal(75); // Free shipping above 2000 EGP
          const total = Decimal.max(0, calculatedSubtotal.minus(discountAmount).plus(shipping)).toDecimalPlaces(2);

          // E. Create Order record strictly as COD + UNPAID + PENDING
          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              trackingTokenHash: tokenHash,
              idempotencyKey: input.idempotencyKey || null,
              customerName: input.customerName.trim(),
              phone: input.phone.trim(),
              email: input.email.trim().toLowerCase(),
              address: input.address.trim(),
              city: input.city.trim(),
              subtotal: calculatedSubtotal.toNumber(),
              discount: discountAmount.toNumber(),
              shipping: shipping.toNumber(),
              total: total.toNumber(),
              couponCode: validCouponCode,
              paymentMethod: 'COD',
              paymentStatus: 'UNPAID',
              orderStatus: 'PENDING',
              notes: input.notes || null,
              items: {
                create: itemsToCreate,
              },
              statusHistory: {
                create: {
                  fromStatus: 'INITIAL',
                  toStatus: 'PENDING',
                  changedBy: 'CUSTOMER',
                  notes: 'Order submitted via Cash on Delivery (COD) checkout.',
                },
              },
            },
            include: {
              items: true,
            },
          });

          return {
            order: this.sanitizeOrderConfirmation(createdOrder),
            trackingToken: rawToken, // Returned ONLY ONCE in successful checkout response
            isDuplicate: false,
          };
        });
      } catch (txError: any) {
        // Handle race conditions on idempotencyKey unique constraint (Prisma P2002)
        if (txError?.code === 'P2002' && input.idempotencyKey) {
          const existing = await prisma.order.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
            include: { items: true },
          });

          if (existing) {
            if (!this.isPayloadMatching(existing, input)) {
              throw {
                statusCode: 409,
                message: 'مفتاح عدم التكرار (Idempotency Key) مسجل مسبقاً لطلب مختلف.',
              };
            }

            return {
              order: this.sanitizeOrderConfirmation(existing),
              trackingToken: null,
              isDuplicate: true,
            };
          }
        }
        throw txError;
      }
    } else {
      // --- Isolated Test Harness Fallback (Forbidden in Production) ---
      if (env.isProduction) {
        throw new Error('[Security Exception] In-memory orders are strictly forbidden in production.');
      }

      // Check stock
      for (const item of input.items) {
        const prod = isolatedTestDb.products.find((p) => p.id === item.productId);
        if (!prod) throw { statusCode: 400, message: 'أحد المنتجات المطلوبة غير متوفر في المتجر.' };
        if (prod.stock < item.quantity) {
          throw {
            statusCode: 400,
            message: `عذراً، الكمية المطلوبة للمنتج "${prod.nameAr || prod.name}" غير متوفرة في المخزون (المتبقي: ${prod.stock}).`,
          };
        }
      }

      // Deduct stock atomically in test harness
      let subtotal = new Decimal(0);
      const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
      const items = input.items.map((i) => {
        const prod = isolatedTestDb.products.find((p) => p.id === i.productId)!;
        prod.stock -= i.quantity;
        const unitPrice = new Decimal(prod.price.toString()).toDecimalPlaces(2);
        const lineTotal = unitPrice.times(i.quantity).toDecimalPlaces(2);
        subtotal = subtotal.plus(lineTotal).toDecimalPlaces(2);
        return {
          id: 'item-' + Math.random().toString(36).substring(2, 8),
          orderId,
          productId: prod.id,
          productName: prod.nameAr || prod.name,
          productImage: prod.image,
          unitPrice: unitPrice.toNumber(),
          quantity: i.quantity,
          total: lineTotal.toNumber(),
          selectedColor: i.selectedColor,
          lensOption: i.lensOption,
        };
      });

      let discountAmount = new Decimal(0);
      let validCouponCode: string | null = null;
      if (input.couponCode && input.couponCode.trim()) {
        const cpn = isolatedTestDb.coupons.find(
          (c) => c.code === input.couponCode!.trim().toUpperCase() && c.isActive
        );
        if (cpn) {
          validCouponCode = cpn.code;
          const cVal = new Decimal(cpn.discountValue.toString());
          if (cpn.discountType === 'PERCENTAGE') {
            discountAmount = subtotal.times(cVal).dividedBy(100).toDecimalPlaces(2);
          } else {
            discountAmount = Decimal.min(cVal, subtotal).toDecimalPlaces(2);
          }
        }
      }

      const shipping = subtotal.greaterThanOrEqualTo(2000) ? new Decimal(0) : new Decimal(75);
      const total = Decimal.max(0, subtotal.minus(discountAmount).plus(shipping)).toDecimalPlaces(2);

      const newOrder = {
        id: orderId,
        orderNumber,
        trackingTokenHash: tokenHash,
        idempotencyKey: input.idempotencyKey || null,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        address: input.address.trim(),
        city: input.city.trim(),
        subtotal: subtotal.toNumber(),
        discount: discountAmount.toNumber(),
        shipping: shipping.toNumber(),
        total: total.toNumber(),
        couponCode: validCouponCode,
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        orderStatus: 'PENDING',
        notes: input.notes || null,
        paidAt: null,
        paidBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items,
      };

      isolatedTestDb.orders.unshift(newOrder);
      return {
        order: this.sanitizeOrderConfirmation(newOrder),
        trackingToken: rawToken,
        isDuplicate: false,
      };
    }
  }

  /**
   * Secure Customer Order Tracking.
   * Verifies tracking token against stored hash using constant-time comparison.
   * STRICTLY transmits token via X-Tracking-Token header (rejects query-string tokens).
   * Returns ONLY non-sensitive, necessary status and progress information.
   * NEVER exposes customer address, phone, email, internal DB IDs, or private data.
   */
  async trackOrder(input: TrackOrderInput) {
    const computedHash = crypto.createHash('sha256').update(input.token.trim()).digest('hex');

    const order = isPostgresConnected
      ? await prisma.order.findUnique({
          where: { orderNumber: input.orderNumber.trim() },
          include: { items: true },
        })
      : isolatedTestDb.orders.find((o) => o.orderNumber === input.orderNumber.trim());

    if (!order || !order.trackingTokenHash) {
      throw { statusCode: 404, message: 'طلب غير موجود أو رمز التتبع غير صحيح.' };
    }

    // Constant-time hash verification to prevent timing attacks
    const storedBuf = Buffer.from(order.trackingTokenHash, 'hex');
    const compBuf = Buffer.from(computedHash, 'hex');

    if (storedBuf.length !== compBuf.length || !crypto.timingSafeEqual(storedBuf, compBuf)) {
      throw { statusCode: 401, message: 'رمز التتبع غير صحيح أو غير مصرح به لهذا الطلب.' };
    }

    // Sanitize output strictly: NEVER return full address, phone, email, internal DB IDs, or token hash
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      city: order.city,
      subtotal: new Decimal(order.subtotal?.toString() || '0').toNumber(),
      discount: new Decimal(order.discount?.toString() || '0').toNumber(),
      shipping: new Decimal(order.shipping?.toString() || '0').toNumber(),
      total: new Decimal(order.total?.toString() || '0').toNumber(),
      createdAt: order.createdAt,
      estimatedDelivery:
        order.orderStatus === 'DELIVERED'
          ? 'تم التوصيل بنجاح'
          : order.orderStatus === 'CANCELLED'
          ? 'الطلب ملغي'
          : 'خلال 2 إلى 4 أيام عمل (الدفع عند الاستلام)',
      items: order.items.map((item: any) => ({
        productName: item.productName,
        productImage: item.productImage || '',
        unitPrice: new Decimal(item.unitPrice?.toString() || '0').toNumber(),
        quantity: item.quantity,
        total: new Decimal(item.total?.toString() || '0').toNumber(),
        selectedColor: item.selectedColor || null,
        lensOption: item.lensOption || null,
      })),
    };
  }

  /**
   * Admin-Only: Retrieve complete order details by ID or orderNumber.
   * STRICTLY requires admin authentication.
   */
  async getOrderByIdForAdmin(idOrNumber: string) {
    const order = isPostgresConnected
      ? await prisma.order.findFirst({
          where: {
            OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
          },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        })
      : isolatedTestDb.orders.find(
          (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
        );

    if (!order) {
      throw { statusCode: 404, message: 'الطلب غير موجود.' };
    }

    return order;
  }

  /**
   * Admin-Only: Retrieve all orders with search, filter, and sorting.
   */
  async getAllOrdersForAdmin(filters: OrderQueryFilters = {}) {
    if (isPostgresConnected) {
      const where: any = {};

      if (filters.orderStatus && filters.orderStatus !== 'all') {
        where.orderStatus = filters.orderStatus.toUpperCase();
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        where.paymentStatus = filters.paymentStatus.toUpperCase();
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
      }

      if (filters.search) {
        const q = filters.search.trim();
        where.OR = [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customerName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      if (filters.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
      if (filters.sortBy === 'total_desc') orderBy = { total: 'desc' };
      if (filters.sortBy === 'total_asc') orderBy = { total: 'asc' };

      return prisma.order.findMany({
        where,
        orderBy,
        include: { items: true },
      });
    } else {
      let result = [...isolatedTestDb.orders];

      if (filters.orderStatus && filters.orderStatus !== 'all') {
        result = result.filter(
          (o) => o.orderStatus.toUpperCase() === filters.orderStatus!.toUpperCase()
        );
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        result = result.filter(
          (o) => o.paymentStatus.toUpperCase() === filters.paymentStatus!.toUpperCase()
        );
      }

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.includes(q)
        );
      }

      if (filters.sortBy === 'oldest') {
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return result;
    }
  }

  /**
   * Admin-Only: Dedicated Cash Collection Action for Cash on Delivery (COD) orders.
   * Transactional, idempotent, logs paidAt and paidBy, records in audit history.
   * Strictly enforces: Order must be DELIVERED before cash collection can be confirmed.
   */
  async collectCash(idOrNumber: string, actor: AdminActor = {}) {
    const actorIdentifier = actor.email || actor.name || 'ADMIN';

    if (isPostgresConnected) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
          },
          include: { items: true },
        });

        if (!order) {
          throw { statusCode: 404, message: 'الطلب غير موجود.' };
        }

        // Only COD orders are eligible for cash collection
        if (order.paymentMethod !== 'COD') {
          throw {
            statusCode: 400,
            message: 'تحصيل النقدية متاح حصراً لطلبات الدفع عند الاستلام (COD).',
          };
        }

        // Prevent cash collection on cancelled orders
        if (order.orderStatus === 'CANCELLED') {
          throw { statusCode: 400, message: 'لا يمكن تحصيل نقدية لطلب ملغي.' };
        }

        // Must be DELIVERED before cash collection
        if (order.orderStatus !== 'DELIVERED') {
          throw {
            statusCode: 400,
            message: `لا يمكن تأكيد تحصيل النقدية لطلبات الدفع عند الاستلام إلا بعد تسليم الطلب للعميل فعلياً (حالة الطلب الحالية: ${order.orderStatus}).`,
          };
        }

        const paidAt = new Date();

        // ATOMIC CONDITIONAL UPDATE:
        // Guarantees that only ONE concurrent transaction transitions UNPAID to PAID.
        const updateResult = await tx.order.updateMany({
          where: {
            id: order.id,
            orderStatus: 'DELIVERED',
            paymentMethod: 'COD',
            paymentStatus: 'UNPAID',
          },
          data: {
            paymentStatus: 'PAID',
            paidAt,
            paidBy: actorIdentifier,
          },
        });

        if (updateResult.count === 1) {
          // Exactly ONE transaction successfully collected cash.
          // Create audit trail ONLY for this successful transition.
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: order.orderStatus,
              toStatus: order.orderStatus,
              changedBy: actorIdentifier,
              notes: `Cash on Delivery (COD) payment collected and confirmed by ${actorIdentifier}.`,
            },
          });

          const updated = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true, statusHistory: true },
          });

          return {
            order: updated,
            alreadyPaid: false,
            message: 'تم تأكيد تحصيل النقدية بنجاح وتسجيل العملية في سجل التدقيق.',
          };
        } else {
          // updateResult.count === 0: Another concurrent transaction already succeeded
          const currentOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true, statusHistory: true },
          });

          if (currentOrder && currentOrder.paymentStatus === 'PAID') {
            return {
              order: currentOrder,
              alreadyPaid: true,
              message: `تم تحصيل النقدية لهذا الطلب مسبقاً بواسطة ${currentOrder.paidBy || 'المسؤول'}.`,
            };
          }

          throw {
            statusCode: 400,
            message: 'تعذر تحصيل النقدية: حالة الطلب الحالية غير مؤهلة للتحصيل.',
          };
        }
      });
    } else {
      // Test Harness (Atomic simulation)
      const order = isolatedTestDb.orders.find(
        (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
      );
      if (!order) throw { statusCode: 404, message: 'الطلب غير موجود.' };

      if (order.paymentMethod !== 'COD') {
        throw {
          statusCode: 400,
          message: 'تحصيل النقدية متاح حصراً لطلبات الدفع عند الاستلام (COD).',
        };
      }

      if (order.orderStatus === 'CANCELLED') {
        throw { statusCode: 400, message: 'لا يمكن تحصيل نقدية لطلب ملغي.' };
      }

      if (order.orderStatus !== 'DELIVERED') {
        throw {
          statusCode: 400,
          message: `لا يمكن تأكيد تحصيل النقدية لطلبات الدفع عند الاستلام إلا بعد تسليم الطلب للعميل فعلياً (حالة الطلب الحالية: ${order.orderStatus}).`,
        };
      }

      // Check if already collected
      if (order.paymentStatus === 'PAID') {
        return {
          order,
          alreadyPaid: true,
          message: `تم تحصيل النقدية لهذا الطلب مسبقاً بواسطة ${order.paidBy || 'المسؤول'}.`,
        };
      }

      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      order.paidBy = actorIdentifier;
      order.updatedAt = new Date();

      isolatedTestDb.statusHistory.push({
        id: 'hist-' + Math.random().toString(36).substring(2, 8),
        orderId: order.id,
        fromStatus: order.orderStatus,
        toStatus: order.orderStatus,
        changedBy: actorIdentifier,
        notes: `Cash on Delivery (COD) payment collected and confirmed by ${actorIdentifier}.`,
        createdAt: new Date(),
      });

      return {
        order,
        alreadyPaid: false,
        message: 'تم تأكيد تحصيل النقدية بنجاح وتسجيل العملية في سجل التدقيق.',
      };
    }
  }

  /**
   * Admin-Only: Updates order status and payment status in an atomic transaction.
   * Validates state machine rules, COD payment collection rules, and restores stock on cancellation.
   */
  async updateOrderStatus(idOrNumber: string, update: UpdateOrderStatusInput, actor: AdminActor = {}) {
    const actorIdentifier = actor.email || actor.name || 'ADMIN';
    const targetStatus = update.orderStatus.toUpperCase();

    if (isPostgresConnected) {
      return prisma.$transaction(async (tx) => {
        // 1. Fetch current order with row items inside transaction
        const order = await tx.order.findFirst({
          where: {
            OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
          },
          include: { items: true },
        });

        if (!order) {
          throw { statusCode: 404, message: 'الطلب غير موجود.' };
        }

        const currentStatus = order.orderStatus.toUpperCase();

        // 2. State Machine Validation
        if (targetStatus !== currentStatus) {
          const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
          if (!allowedNext.includes(targetStatus)) {
            throw {
              statusCode: 400,
              message: `انتقال حالة الطلب غير صالح من "${currentStatus}" إلى "${targetStatus}". الحالات المتاحة هي: ${allowedNext.join(', ') || 'لا توجد'}.`,
            };
          }
        }

        // 3. Payment Status Rules (COD):
        // Generic status update MUST NOT bypass dedicated cash collection
        let resolvedPaymentStatus = order.paymentStatus;
        let paidAt = order.paidAt;
        let paidBy = order.paidBy;

        if (update.paymentStatus) {
          const targetPayment = update.paymentStatus.toUpperCase();
          if (targetPayment === 'PAID') {
            throw {
              statusCode: 400,
              message:
                'لا يمكن تعيين حالة الدفع مباشرة إلى مدفوع (PAID) عبر مسار تعديل الحالة العام. يجب تسجيل تحصيل النقدية حصراً عبر الإجراء المخصص (POST /api/orders/:id/collect-cash).',
            };
          }
          resolvedPaymentStatus = targetPayment;
        }

        // 4. Handle Cancellation with Atomic Stock Restoration
        if (targetStatus === 'CANCELLED' && currentStatus !== 'CANCELLED') {
          if (currentStatus === 'DELIVERED') {
            throw {
              statusCode: 400,
              message: 'لا يمكن إلغاء طلب تم توصيله للعميل بالفعل.',
            };
          }

          // Atomic conditional update ensures concurrent cancel requests only restore stock once
          const conditionalCancel = await tx.order.updateMany({
            where: {
              id: order.id,
              orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
            },
            data: {
              orderStatus: 'CANCELLED',
              paymentStatus: 'UNPAID', // Cancelled COD orders remain UNPAID
              cancelledAt: new Date(),
              cancelledBy: actorIdentifier,
              cancellationReason: update.cancellationReason || update.notes || 'Cancelled by admin',
            },
          });

          if (conditionalCancel.count === 0) {
            throw {
              statusCode: 400,
              message: 'تعذر إلغاء الطلب: ربما تم إلغاؤه مسبقاً أو تم تسليمه.',
            };
          }

          // Restore inventory for each item exactly once
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          // Record in Audit History
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: currentStatus,
              toStatus: 'CANCELLED',
              changedBy: actorIdentifier,
              notes: update.notes || update.cancellationReason || 'Order cancelled',
            },
          });

          return tx.order.findUnique({
            where: { id: order.id },
            include: { items: true, statusHistory: true },
          });
        }

        // 5. Standard non-cancellation status update
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: targetStatus,
            paymentStatus: resolvedPaymentStatus,
            paidAt,
            paidBy,
            notes: update.notes !== undefined ? update.notes : order.notes,
          },
          include: { items: true },
        });

        // Audit Trail
        if (targetStatus !== currentStatus) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: currentStatus,
              toStatus: targetStatus,
              changedBy: actorIdentifier,
              notes: update.notes || `Status changed from ${currentStatus} to ${targetStatus}`,
            },
          });
        }

        return updatedOrder;
      });
    } else {
      // --- Test Harness Fallback ---
      const order = isolatedTestDb.orders.find(
        (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
      );
      if (!order) throw { statusCode: 404, message: 'الطلب غير موجود.' };

      const currentStatus = order.orderStatus.toUpperCase();

      if (targetStatus !== currentStatus) {
        const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNext.includes(targetStatus)) {
          throw {
            statusCode: 400,
            message: `انتقال حالة الطلب غير صالح من "${currentStatus}" إلى "${targetStatus}".`,
          };
        }
      }

      if (update.paymentStatus && update.paymentStatus.toUpperCase() === 'PAID') {
        throw {
          statusCode: 400,
          message:
            'لا يمكن تعيين حالة الدفع مباشرة إلى مدفوع (PAID) عبر مسار تعديل الحالة العام. يجب تسجيل تحصيل النقدية حصراً عبر الإجراء المخصص (POST /api/orders/:id/collect-cash).',
        };
      }

      if (targetStatus === 'CANCELLED' && currentStatus !== 'CANCELLED') {
        if (currentStatus === 'DELIVERED') {
          throw { statusCode: 400, message: 'لا يمكن إلغاء طلب تم توصيله للعميل بالفعل.' };
        }

        // Restore stock
        for (const item of order.items) {
          const prod = isolatedTestDb.products.find((p) => p.id === item.productId);
          if (prod) prod.stock += item.quantity;
        }

        order.orderStatus = 'CANCELLED';
        order.paymentStatus = 'UNPAID';
        order.cancelledAt = new Date();
        order.cancelledBy = actorIdentifier;
        order.cancellationReason = update.cancellationReason || update.notes || 'Cancelled';
        order.updatedAt = new Date();
        return order;
      }

      order.orderStatus = targetStatus;
      if (update.paymentStatus) order.paymentStatus = update.paymentStatus.toUpperCase();
      if (update.notes !== undefined) order.notes = update.notes;
      order.updatedAt = new Date();
      return order;
    }
  }
}

export const orderService = new OrderService();
