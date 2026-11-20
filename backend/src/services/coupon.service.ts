import { env } from '../config/env';
import { isPostgresConnected, isolatedTestDb, prisma } from '../database/prisma';

export class CouponService {
  async validate(code: string) {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة التحقق من الكوبونات غير متاحة حالياً.' };
    }

    const cleanCode = code.trim().toUpperCase();

    let coupon: any = null;

    if (isPostgresConnected) {
      coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });
    } else {
      coupon = isolatedTestDb.coupons.find((c) => c.code === cleanCode);
    }

    if (!coupon) {
      throw { statusCode: 404, message: 'كود الخصم غير موجود أو غير صالح.' };
    }

    if (!coupon.isActive) {
      throw { statusCode: 400, message: 'عذراً، تم تعطيل هذا الكوبون حالياً.' };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw { statusCode: 400, message: 'عذراً، انتهت صلاحية كود الخصم هذا.' };
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      isActive: coupon.isActive,
    };
  }

  async validateCoupon(code: string) {
    return this.validate(code);
  }

  async getAll() {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة الكوبونات غير متاحة حالياً.' };
    }

    if (isPostgresConnected) {
      return prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return [...isolatedTestDb.coupons].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  async getById(id: string) {
    if (isPostgresConnected) {
      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      return coupon;
    } else {
      const coupon = isolatedTestDb.coupons.find((c) => c.id === id);
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      return coupon;
    }
  }

  async create(data: {
    code: string;
    discountType?: string;
    discountValue: number;
    isActive?: boolean;
    expiryDate?: string | null;
  }) {
    const cleanCode = data.code.trim().toUpperCase();

    if (isPostgresConnected) {
      const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
      if (existing) {
        throw { statusCode: 400, message: `كود الخصم "${cleanCode}" مسجل مسبقاً.` };
      }

      return prisma.coupon.create({
        data: {
          code: cleanCode,
          discountType: data.discountType || 'PERCENTAGE',
          discountValue: data.discountValue,
          isActive: data.isActive !== undefined ? data.isActive : true,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });
    } else {
      const existing = isolatedTestDb.coupons.find((c) => c.code === cleanCode);
      if (existing) throw { statusCode: 400, message: `كود الخصم "${cleanCode}" مسجل مسبقاً.` };

      const newCoupon = {
        id: 'cpn-' + Math.random().toString(36).substring(2, 7),
        code: cleanCode,
        discountType: data.discountType || 'PERCENTAGE',
        discountValue: data.discountValue,
        isActive: data.isActive !== undefined ? data.isActive : true,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      isolatedTestDb.coupons.push(newCoupon);
      return newCoupon;
    }
  }

  async update(id: string, data: any) {
    if (data.code) data.code = data.code.trim().toUpperCase();
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    if (isPostgresConnected) {
      return prisma.coupon.update({
        where: { id },
        data,
      });
    } else {
      const idx = isolatedTestDb.coupons.findIndex((c) => c.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      isolatedTestDb.coupons[idx] = {
        ...isolatedTestDb.coupons[idx],
        ...data,
        updatedAt: new Date(),
      };
      return isolatedTestDb.coupons[idx];
    }
  }

  async toggleActive(id: string) {
    if (isPostgresConnected) {
      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      return prisma.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
      });
    } else {
      const coupon = isolatedTestDb.coupons.find((c) => c.id === id);
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      coupon.isActive = !coupon.isActive;
      coupon.updatedAt = new Date();
      return coupon;
    }
  }

  async delete(id: string) {
    if (isPostgresConnected) {
      return prisma.coupon.delete({ where: { id } });
    } else {
      const idx = isolatedTestDb.coupons.findIndex((c) => c.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'الكوبون غير موجود.' };
      const deleted = isolatedTestDb.coupons.splice(idx, 1)[0];
      return deleted;
    }
  }
}

export const couponService = new CouponService();
