import { fallbackDb, isPostgresConnected, prisma } from '../database/prisma';
import { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validator';

export interface OrderQueryFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';
}

export class OrderService {
  /**
   * Helper to generate unique order number: e.g. OPT-2026-00012
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = isPostgresConnected
      ? (await prisma.order.count()) + 1
      : fallbackDb.orders.length + 1;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const seq = String(count).padStart(4, '0');
    return `OPT-${year}-${seq}${randomSuffix % 10}`;
  }

  /**
   * Creates a new customer order with server-side pricing, stock check, and coupon validation.
   */
  async createOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw { statusCode: 400, message: 'سلة المشتريات فارغة.' };
    }

    // 1. Fetch real products from DB to prevent price tampering
    const productIds = input.items.map((i) => i.productId);
    let dbProducts: any[] = [];

    if (isPostgresConnected) {
      dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
    } else {
      dbProducts = fallbackDb.products.filter((p) => productIds.includes(p.id));
    }

    if (dbProducts.length !== productIds.length) {
      throw {
        statusCode: 400,
        message: 'أحد المنتجات المطلوبة غير متوفر في المتجر.',
      };
    }

    // 2. Validate stock & calculate subtotal strictly on the server
    let calculatedSubtotal = 0;
    const orderItemsToCreate: Array<{
      productId: string;
      productName: string;
      productImage: string;
      unitPrice: number;
      quantity: number;
      total: number;
      selectedColor?: string;
      lensOption?: string;
    }> = [];

    for (const item of input.items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (!dbProd) {
        throw { statusCode: 400, message: `المنتج رقم ${item.productId} غير موجود.` };
      }

      if (dbProd.stock < item.quantity) {
        throw {
          statusCode: 400,
          message: `عذراً، الكمية المطلوبة للمنتج "${dbProd.nameAr || dbProd.name}" غير متوفرة في المخزون (المتبقي: ${dbProd.stock}).`,
        };
      }

      const unitPrice = dbProd.price;
      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      orderItemsToCreate.push({
        productId: dbProd.id,
        productName: dbProd.nameAr || dbProd.name,
        productImage: dbProd.image || dbProd.thumbnail || (dbProd.images && dbProd.images[0]) || '',
        unitPrice,
        quantity: item.quantity,
        total: lineTotal,
        selectedColor: item.selectedColor || undefined,
        lensOption: item.lensOption || undefined,
      });
    }

    // 3. Validate coupon if applied
    let discountAmount = 0;
    let validCouponCode: string | null = null;

    if (input.couponCode && input.couponCode.trim() !== '') {
      const code = input.couponCode.trim().toUpperCase();
      let coupon: any = null;

      if (isPostgresConnected) {
        coupon = await prisma.coupon.findUnique({ where: { code } });
      } else {
        coupon = fallbackDb.coupons.find((c) => c.code === code);
      }

      if (coupon && coupon.isActive) {
        if (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) {
          validCouponCode = coupon.code;
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          } else {
            discountAmount = Math.min(calculatedSubtotal, coupon.discountValue);
          }
        }
      }
    }

    // 4. Calculate shipping (Free if total after discount >= 500 EGP, else 50 EGP)
    const afterDiscount = calculatedSubtotal - discountAmount;
    const shipping = afterDiscount >= 500 ? 0 : 50;
    const grandTotal = Math.max(0, afterDiscount + shipping);

    const orderNumber = await this.generateOrderNumber();

    // 5. Transactional Execution
    if (isPostgresConnected) {
      const createdOrder = await prisma.$transaction(async (tx) => {
        // Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            customerName: input.customerName.trim(),
            phone: input.phone.trim(),
            email: input.email.trim().toLowerCase(),
            address: input.address.trim(),
            city: input.city.trim(),
            subtotal: calculatedSubtotal,
            discount: discountAmount,
            shipping,
            total: grandTotal,
            couponCode: validCouponCode,
            paymentMethod: input.paymentMethod || 'demo_card',
            paymentStatus: 'Demo Paid',
            orderStatus: 'Pending',
            notes: input.notes || null,
            items: {
              create: orderItemsToCreate.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                total: item.total,
                selectedColor: item.selectedColor,
                lensOption: item.lensOption,
              })),
            },
          },
          include: { items: true },
        });

        // Decrement Product Stock
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Increment Coupon Usage
        if (validCouponCode) {
          await tx.coupon.update({
            where: { code: validCouponCode },
            data: { usageCount: { increment: 1 } },
          });
        }

        return order;
      });

      return createdOrder;
    } else {
      // In-Memory Fallback Transaction
      const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
      const createdItems = orderItemsToCreate.map((item) => ({
        id: 'item-' + Math.random().toString(36).substring(2, 8),
        orderId,
        ...item,
        createdAt: new Date(),
      }));

      const newOrder = {
        id: orderId,
        orderNumber,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        address: input.address.trim(),
        city: input.city.trim(),
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shipping,
        total: grandTotal,
        couponCode: validCouponCode,
        paymentMethod: input.paymentMethod || 'demo_card',
        paymentStatus: 'Demo Paid',
        orderStatus: 'Pending',
        notes: input.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: createdItems,
      };

      // Decrement stock
      for (const item of input.items) {
        const prod = fallbackDb.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }

      // Increment coupon usage
      if (validCouponCode) {
        const cpn = fallbackDb.coupons.find((c) => c.code === validCouponCode);
        if (cpn) cpn.usageCount++;
      }

      fallbackDb.orders.unshift(newOrder);
      return newOrder;
    }
  }

  /**
   * Retrieves all orders with filtering, search, and sorting for Admin Dashboard.
   */
  async getAllOrders(filters: OrderQueryFilters = {}) {
    if (isPostgresConnected) {
      const where: any = {};

      if (filters.orderStatus && filters.orderStatus !== 'all') {
        where.orderStatus = filters.orderStatus;
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        where.paymentStatus = filters.paymentStatus;
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
      if (filters.sortBy === 'date-asc') orderBy = { createdAt: 'asc' };
      if (filters.sortBy === 'total-desc') orderBy = { total: 'desc' };
      if (filters.sortBy === 'total-asc') orderBy = { total: 'asc' };

      return prisma.order.findMany({
        where,
        orderBy,
        include: { items: true },
      });
    } else {
      let result = [...fallbackDb.orders];

      if (filters.orderStatus && filters.orderStatus !== 'all') {
        result = result.filter(
          (o) => o.orderStatus.toLowerCase() === filters.orderStatus!.toLowerCase()
        );
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        const pStatus = filters.paymentStatus.toLowerCase().replace('_', ' ');
        result = result.filter(
          (o) => o.paymentStatus.toLowerCase().replace('_', ' ') === pStatus
        );
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        result = result.filter((o) => new Date(o.createdAt).getTime() >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime();
        result = result.filter((o) => new Date(o.createdAt).getTime() <= end);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.email.toLowerCase().includes(q)
        );
      }

      switch (filters.sortBy) {
        case 'date-asc':
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'total-desc':
          result.sort((a, b) => b.total - a.total);
          break;
        case 'total-asc':
          result.sort((a, b) => a.total - b.total);
          break;
        case 'date-desc':
        default:
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      return result;
    }
  }

  /**
   * Retrieves single order by ID or orderNumber with full items details.
   */
  async getOrderById(idOrNumber: string) {
    if (isPostgresConnected) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
        },
        include: { items: true },
      });

      if (!order) throw { statusCode: 404, message: 'الطلب غير موجود.' };
      return order;
    } else {
      const order = fallbackDb.orders.find(
        (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
      );
      if (!order) throw { statusCode: 404, message: 'الطلب غير موجود.' };
      return order;
    }
  }

  /**
   * Updates order status and payment status in PostgreSQL.
   */
  async updateOrderStatus(id: string, update: UpdateOrderStatusInput) {
    const order = await this.getOrderById(id);

    // If order is transitioning to Cancelled, restore stock
    if (update.orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      if (isPostgresConnected) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      } else {
        for (const item of order.items) {
          const prod = fallbackDb.products.find((p) => p.id === item.productId);
          if (prod) prod.stock += item.quantity;
        }
      }
    }

    if (isPostgresConnected) {
      return prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: update.orderStatus,
          ...(update.paymentStatus && { paymentStatus: update.paymentStatus }),
          ...(update.notes && { notes: update.notes }),
        },
        include: { items: true },
      });
    } else {
      const idx = fallbackDb.orders.findIndex((o) => o.id === order.id);
      fallbackDb.orders[idx] = {
        ...fallbackDb.orders[idx],
        orderStatus: update.orderStatus,
        ...(update.paymentStatus && { paymentStatus: update.paymentStatus }),
        ...(update.notes && { notes: update.notes }),
        updatedAt: new Date(),
      };
      return fallbackDb.orders[idx];
    }
  }
}

export const orderService = new OrderService();
